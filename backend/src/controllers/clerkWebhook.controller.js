import { Webhook } from 'svix';
import { User } from '../models/User.model.js';

export const handleClerkWebhook = async (req, res) => {
    try {
        // Get the headers
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!WEBHOOK_SECRET) {
            throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
        }

        // Get the headers
        const svix_id = req.headers['svix-id'];
        const svix_timestamp = req.headers['svix-timestamp'];
        const svix_signature = req.headers['svix-signature'];

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ error: 'Error occurred -- no svix headers' });
        }

        // Get the body
        const payload = req.body;
        const body = JSON.stringify(payload);

        // Create a new Svix instance with your webhook secret
        const wh = new Webhook(WEBHOOK_SECRET);

        let evt;

        // Verify the payload with the headers
        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return res.status(400).json({ error: 'Error occurred during verification' });
        }

        // Handle the webhook
        const eventType = evt.type;

        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

            // Create user in MongoDB
            const user = await User.create({
                clerkId: id,
                email: email_addresses[0].email_address,
                name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
                username: username || undefined,
                imageUrl: image_url || ''
            });

            console.log('User created:', user);
        }

        if (eventType === 'user.updated') {
            const { id, email_addresses, first_name, last_name, username, image_url } = evt.data;

            // Update user in MongoDB
            await User.findOneAndUpdate(
                { clerkId: id },
                {
                    email: email_addresses[0].email_address,
                    name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
                    username: username || undefined,
                    imageUrl: image_url || ''
                }
            );

            console.log('User updated:', id);
        }

        if (eventType === 'user.deleted') {
            const { id } = evt.data;

            // Delete user from MongoDB
            await User.findOneAndDelete({ clerkId: id });

            console.log('User deleted:', id);
        }

        return res.status(200).json({ message: 'Webhook received' });

    } catch (error) {
        console.error('Error in webhook handler:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};