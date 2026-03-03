# iRacing OAuth Implementation Notes

## iRacing OAuth Documentation References

iRacing mentioned these resources for implementation:
- Review `/authorize` endpoint documentation
- Review `/token` endpoint documentation  
- Example repo: https://github.com/iRacing/iracing-password-limited-oauth-client

## Current Implementation Status

### Authorization Code Flow (What we have)

**Endpoints Created:**
- `/api/auth/iracing/authorize` - Starts OAuth flow
- `/api/auth/iracing/callback` - Handles OAuth redirect

**Flow:**
1. User clicks "Connect with iRacing" → `/api/auth/iracing/authorize`
2. Redirects to iRacing: `https://members-ng.iracing.com/oauth2/authorize`
3. User logs in on iRacing.com and authorizes
4. iRacing redirects back to: `https://vessiaracing.com/api/auth/iracing/callback?code=...`
5. Exchange code for token: POST to `https://members-ng.iracing.com/oauth2/token`
6. Fetch user info: GET `https://members-ng.iracing.com/oauth2/userinfo`
7. Save customer ID to database

**Parameters Used:**
- `client_id`: vessia-racing
- `client_secret`: cultural-VERTIGO-Hyperlink-grimacing-DROWN-manlike
- `redirect_uri`: https://vessiaracing.com/api/auth/iracing/callback
- `response_type`: code
- `grant_type`: authorization_code
- `scope`: openid profile email
- `audience`: data-server

## Important iRacing-Specific Details

Based on your client approval message:
- **Client Type**: Authorization Code authentication flow
- **Audience**: data-server
- **Purpose**: Can make requests on behalf of users and validate their identity

## Potential Issues to Verify

1. **Scope parameter**: Need to verify if iRacing accepts "openid profile email" or requires different scopes
2. **State parameter**: Currently generated but not validated - should add CSRF validation
3. **PKCE**: May want to add PKCE for additional security (if supported)

## Testing Checklist

Before going live:
- [ ] Add environment variables to Vercel
- [ ] Test authorization flow on production domain
- [ ] Verify token exchange works
- [ ] Verify customer ID is correctly extracted from userinfo
- [ ] Test error handling (denied access, etc.)
- [ ] Verify stats fetching works with OAuth token

## Next Steps

1. Add environment variables to production
2. Deploy to Vercel
3. Test complete flow on vessiaracing.com
4. Monitor logs for any OAuth errors
