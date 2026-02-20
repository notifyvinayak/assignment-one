<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">

                    {{-- Purple header --}}
                    <tr>
                        <td style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 40px 40px 30px;">
                            <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 8px;">🎫 Booking Confirmed!</h1>
                            <p style="color: #c4b5fd; font-size: 14px; margin: 0;">Your tickets are secured and ready.</p>
                        </td>
                    </tr>

                    {{-- Booking details --}}
                    <tr>
                        <td style="padding: 32px 40px;">
                            <p style="font-size: 16px; color: #374151; margin: 0 0 24px;">
                                Hi <strong>{{ $booking->user->name }}</strong>, thanks for booking!
                            </p>

                            <table width="100%" cellpadding="12" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 12px; border-collapse: separate;">
                                <tr style="background-color: #f9fafb;">
                                    <td style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Event</td>
                                    <td style="font-size: 15px; color: #111827; font-weight: 600;">{{ $booking->event->name }}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Booking ID</td>
                                    <td style="font-size: 15px; color: #111827;">#{{ $booking->id }}</td>
                                </tr>
                                <tr style="background-color: #f9fafb;">
                                    <td style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Tickets</td>
                                    <td style="font-size: 15px; color: #111827; font-weight: 600;">{{ $booking->quantity }}</td>
                                </tr>
                                <tr>
                                    <td style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Total</td>
                                    <td style="font-size: 15px; color: #7c3aed; font-weight: 700;">₹{{ number_format($booking->event->price * $booking->quantity) }}</td>
                                </tr>
                                <tr style="background-color: #f9fafb;">
                                    <td style="font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Status</td>
                                    <td>
                                        <span style="display: inline-block; background-color: #d1fae5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 9999px;">
                                            ✓ Confirmed
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                            <p style="font-size: 13px; color: #9ca3af; margin: 0; text-align: center;">
                                This is an automated confirmation from the Coldplay Mumbai 2026 Ticketing System.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
