import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  try {
    const body = await req.text();
    const { email, city } = JSON.parse(body || '{}');
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'No email provided' }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const RESEND_KEY = Deno.env.get('RESEND_API_KEY');

    // Send welcome email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_KEY}`
      },
      body: JSON.stringify({
        from: "CloseoutMap <hello@closeoutmap.com>",
        to: email,
        subject: "You're subscribed to CloseoutMap! 🗺️",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0d0d14;color:white;">
            <h1 style="color:#FF3B1F;">CloseoutMap 🗺️</h1>
            <hr style="border:1px solid #333;margin:20px 0;">
            <h2 style="color:white;">You're in! 🎉</h2>
            <p style="color:#ccc;line-height:1.7;">Welcome! You'll receive alerts when a store closes near <strong style="color:white;">${city || 'you'}</strong>.</p>
            <p style="color:#ccc;line-height:1.7;">We track liquidation sales across the US & Canada — shop up to <strong style="color:#FF3B1F;">90% off</strong> before shelves go empty.</p>
            <a href="https://closeoutmap.com" style="display:inline-block;background:#FF3B1F;color:white;padding:14px 30px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">Explore the Map →</a>
            <hr style="border:1px solid #333;margin:20px 0;">
            <p style="color:#666;font-size:12px;">You subscribed at closeoutmap.com. To unsubscribe, reply to this email.</p>
          </div>
        `
      })
    });

    const resendData = await resendResponse.json();
    
    if (!resendResponse.ok) {
      console.error('Resend error:', resendData);
      return new Response(JSON.stringify({ success: true, email_sent: false }), { 
        headers: { "Content-Type": "application/json" } 
      });
    }

    return new Response(JSON.stringify({ success: true, email_sent: true }), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});