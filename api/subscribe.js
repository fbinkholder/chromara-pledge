export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, location, public: isPublic, updates } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    const BREVO_API_KEY = process.env.BREVO_API_KEY;
    if (!BREVO_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const firstName = name.split(' ')[0];

        // Add contact to Brevo
        await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                email: email,
                attributes: {
                    FIRSTNAME: firstName,
                    LASTNAME: name.split(' ').slice(1).join(' ') || '',
                    FULLNAME: name,
                    LOCATION: location || '',
                    PLEDGE_SIGNED: true,
                    PLEDGE_DATE: new Date().toISOString()
                },
                listIds: [parseInt(process.env.BREVO_LIST_ID) || 2],
                updateEnabled: true
            })
        });

        // Send welcome email
        await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json',
                'api-key': BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: { name: 'Chromara', email: process.env.SENDER_EMAIL || 'hello@chromarabeauty.com' },
                to: [{ email: email, name: name }],
                subject: `${firstName}, Thank You For Pledging For Shade Equity.`,
                htmlContent: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#FFFBF5;color:#1F1F23"><div style="display:none">You've joined thousands demanding true shade equity...</div><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFBF5"><tr><td align="center" style="padding:40px 20px"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:linear-gradient(135deg,#1F1F23 0%,#2D1B4E 50%,#6D28D9 100%);border-radius:24px"><tr><td style="padding:50px 40px 30px;text-align:center"><h1 style="margin:0;color:#fff;font-size:28px;font-weight:700">${firstName}, Thank You For Pledging For Shade Equity.</h1></td></tr><tr><td style="padding:0 40px 30px;text-align:center"><p style="margin:0;color:rgba(255,255,255,0.9);font-size:18px;line-height:1.6">You've just joined a movement of thousands demanding something revolutionary: <strong style="color:#A78BFA">foundation that actually matches.</strong></p></td></tr><tr><td style="padding:0 40px"><div style="height:1px;background:linear-gradient(90deg,transparent,rgba(167,139,250,0.5),transparent)"></div></td></tr><tr><td style="padding:40px"><h2 style="margin:0 0 20px;color:#A78BFA;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Why This Matters</h2><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.1)"><p style="margin:0;color:rgba(255,255,255,0.9);font-size:15px;line-height:1.6"><strong style="color:#fff">Traditional brands offer ~40 shades.</strong><br>They call this "inclusive." It's not. It's a marketing budget disguised as progress.</p></td></tr><tr><td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.1)"><p style="margin:0;color:rgba(255,255,255,0.9);font-size:15px;line-height:1.6"><strong style="color:#fff">Chromara NovaMirror generates 4.5 million shades.</strong><br>Your exact undertone. Your exact depth. Created on-demand, not mass-produced.</p></td></tr><tr><td style="padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.1)"><p style="margin:0;color:rgba(255,255,255,0.9);font-size:15px;line-height:1.6"><strong style="color:#fff">True inclusivity, not brands profiting off you.</strong><br>The average person spends $300-500/year searching for a shade match. That's not skincare—that's a tax on being underserved.</p></td></tr><tr><td style="padding:16px 0"><p style="margin:0;color:rgba(255,255,255,0.9);font-size:15px;line-height:1.6"><strong style="color:#fff">Reducing waste by 40%.</strong><br>40% of foundation gets returned because it doesn't match. On-demand formulation means nothing gets made until it's made for <em>you</em>.</p></td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:24px;margin-top:24px;box-shadow:0 4px 20px rgba(139,92,246,0.1)"><tr><td style="padding:40px"><h2 style="margin:0 0 24px;color:#6D28D9;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">What Happens Next</h2><p style="margin:0 0 24px;color:#1F1F23;font-size:16px;line-height:1.6">The NovaMirror is in final development. When it's ready for preorders, pledge signers get <strong>priority access</strong>.</p><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:10px 0 30px"><a href="https://chromarabeauty.com/waitlist" style="display:inline-block;padding:18px 40px;background:linear-gradient(135deg,#8B5CF6 0%,#6D28D9 100%);color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:16px">Join the Future of Foundation →</a></td></tr></table><p style="margin:0;color:#666;font-size:14px;text-align:center">Sign up for the waitlist to be notified when preorders open.</p></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:rgba(139,92,246,0.05);border-radius:24px;margin-top:24px;border:1px solid rgba(139,92,246,0.1)"><tr><td style="padding:40px;text-align:center"><h2 style="margin:0 0 16px;color:#1F1F23;font-size:18px;font-weight:600">In the Meantime</h2><p style="margin:0 0 24px;color:#666;font-size:15px">Follow our journey and join the conversation:</p><table cellpadding="0" cellspacing="0" align="center"><tr><td style="padding:0 8px"><a href="https://instagram.com/chromarabeauty" style="display:inline-block;width:44px;height:44px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743);border-radius:12px;text-align:center;line-height:44px;color:#fff;text-decoration:none;font-size:20px">📷</a></td><td style="padding:0 8px"><a href="https://tiktok.com/@chromarabeauty" style="display:inline-block;width:44px;height:44px;background:#000;border-radius:12px;text-align:center;line-height:44px;color:#fff;text-decoration:none;font-size:20px">🎵</a></td><td style="padding:0 8px"><a href="https://twitter.com/chromarabeauty" style="display:inline-block;width:44px;height:44px;background:#000;border-radius:12px;text-align:center;line-height:44px;color:#fff;text-decoration:none;font-size:20px">𝕏</a></td><td style="padding:0 8px"><a href="https://youtube.com/@chromarabeauty" style="display:inline-block;width:44px;height:44px;background:#FF0000;border-radius:12px;text-align:center;line-height:44px;color:#fff;text-decoration:none;font-size:20px">▶</a></td></tr></table><div style="margin-top:30px;padding:20px;background:rgba(255,255,255,0.8);border-radius:16px"><p style="margin:0 0 12px;color:#1F1F23;font-size:15px;font-weight:600">Know someone tired of shade-matching roulette?</p><p style="margin:0;color:#666;font-size:14px">Forward this email or share: <a href="https://chromarabeauty.com/pledge" style="color:#8B5CF6;font-weight:600">chromarabeauty.com/pledge</a></p></div><p style="margin:24px 0 0;color:#8B5CF6;font-size:14px;font-weight:600">#ShadeEquityNow #PledgeForShadeEquity</p></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin-top:40px"><tr><td style="text-align:center;padding:20px"><p style="margin:0 0 8px;color:#999;font-size:13px">Chromara Inc. | Making shade equity a reality</p><p style="margin:0;color:#bbb;font-size:12px">You received this because you signed the Pledge for Shade Equity.</p></td></tr></table></td></tr></table></body></html>`
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Failed to process signup' });
    }
}
