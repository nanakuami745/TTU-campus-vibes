import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// This client uses the SERVICE ROLE key, which bypasses Row Level
// Security entirely. It must NEVER be sent to the browser — it only
// ever lives here, as a server environment variable. The frontend
// never sees it; it only talks to this server over HTTPS.
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const INDEX_NUMBER_SLASH = /^[A-Z]{2,4}\/[A-Z]{2,4}\/\d{2,4}\/\d{2,4}$/;
const INDEX_NUMBER_NUMERIC = /^\d{8,12}$/;

function isValidIndexNumber(value) {
    if (!value) return false;
    const v = value.trim().toUpperCase();
    return INDEX_NUMBER_SLASH.test(v) || INDEX_NUMBER_NUMERIC.test(v);
}

function generateTempPassword() {
    // 10-character, human-shareable temporary password (letters + digits)
    return crypto.randomBytes(8).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
}

app.get('/', (req, res) => {
    res.json({
        name: 'TTU Campus Vibes Utility API',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

// Admin-only: create a student account directly, bypassing self-registration.
// The caller's own access token is verified server-side on every request —
// the frontend claiming "I'm an admin" is never trusted on its own.
app.post('/admin/create-student', async (req, res) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Missing authorization token' });
        }

        // Confirm the token belongs to a real, currently valid session
        const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token);
        if (callerError || !caller) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Confirm that caller is actually an admin (never trust the client for this)
        const { data: callerProfile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', caller.id)
            .single();

        if (profileError || callerProfile?.role !== 'admin') {
            return res.status(403).json({ error: 'Only admins can add student accounts' });
        }

        const { full_name, email, index_number, department, level } = req.body;

        if (!full_name?.trim() || !email?.trim() || !index_number?.trim()) {
            return res.status(400).json({ error: 'Full name, email, and index number are required' });
        }

        if (!email.trim().toLowerCase().endsWith('@ttu.edu.gh')) {
            return res.status(400).json({ error: 'Only @ttu.edu.gh email addresses are allowed' });
        }

        if (!isValidIndexNumber(index_number)) {
            return res.status(400).json({ error: 'Index Number must be in the format BC/HPM/202/23 or 0723000012' });
        }

        const tempPassword = generateTempPassword();

        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password: tempPassword,
            email_confirm: true, // Admin-added accounts skip the confirmation step
            user_metadata: {
                full_name: full_name.trim(),
                index_number: index_number.trim().toUpperCase(),
                department: department?.trim() || null,
                level: level?.trim() || null
            }
        });

        if (createError) {
            if (createError.message?.includes('already been registered')) {
                return res.status(409).json({ error: 'An account with this email already exists' });
            }
            if (createError.message?.includes('index_number') || createError.code === '23505') {
                return res.status(409).json({ error: 'This Index Number is already registered to another account' });
            }
            return res.status(400).json({ error: createError.message });
        }

        return res.status(201).json({
            success: true,
            user: {
                id: created.user.id,
                email: created.user.email,
                full_name: full_name.trim()
            },
            temporary_password: tempPassword
        });
    } catch (err) {
        console.error('Error creating student account:', err);
        return res.status(500).json({ error: 'Something went wrong creating this account' });
    }
});

app.listen(PORT, () => {
    console.log(`Utility server running on port ${PORT}`);
});
