
# Plan: Enhanced Security Clauses & Terms Agreement System

## Overview
Strengthen the Terms of Service with explicit prohibitions against hacking, carding, and cybercrime. Add a mandatory "I Agree to Terms" checkbox during signup to create a legal consent record.

---

## Changes Required

### 1. Update Terms of Service (Database Update)
Add a new dedicated section specifically addressing cybersecurity violations:

**New Section: "Cybercrime & Security Violations"**
- Explicitly prohibit hacking, unauthorized access, exploiting vulnerabilities
- Prohibit carding, credit card fraud, financial crimes
- Prohibit phishing, social engineering, identity theft
- Prohibit DDoS attacks, botnets, malware distribution
- Prohibit dark web activities, illegal marketplaces
- Prohibit bypassing authentication or security measures
- Include criminal penalty warnings

**Update "Prohibited Activities" section** to add:
- Carding or credit card testing/fraud
- Hacking, cracking, or unauthorized system access
- Distribution of stolen data or credentials
- Use for ransomware or extortion
- Cryptojacking or unauthorized cryptocurrency mining

### 2. Update Privacy Policy (Database Update)
Add stronger language about:
- Complete cooperation with cybercrime investigations
- IP address logging for security and legal compliance
- Right to report suspicious activities to authorities
- No encryption of user activity logs (for law enforcement access)

### 3. Add Terms Acceptance Checkbox on Signup (Auth.tsx)
**UI Changes:**
- Add a checkbox before the signup button: "I agree to the Terms of Service and Privacy Policy"
- Checkbox must be checked to enable the signup button
- Links to TOS and Privacy Policy open in new tabs
- Store consent timestamp in user profile

**Database:**
- Add `terms_accepted_at` column to `profiles` table
- Record when user accepted terms for legal compliance

### 4. Add Guest Terms Banner (EmailGenerator.tsx)
For non-registered users generating emails:
- Show a small notice: "By using this service, you agree to our Terms of Service"
- Link to TOS page
- No blocking checkbox (to keep it user-friendly) but creates implicit consent

---

## Technical Implementation

### Database Migration
```sql
-- Add terms acceptance tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0';
```

### Auth.tsx Changes
- Add state for `agreedToTerms` checkbox
- Add validation that checkbox is checked before signup
- Save consent timestamp when user signs up
- Add styled checkbox with links to TOS/Privacy Policy

### Terms of Service Content Update
Add new sections:
- Section 4.1: Cybersecurity Violations (Hacking/Carding)
- Section 4.2: Financial Crime Prohibition
- Section 4.3: Data Theft & Privacy Violations
- Enhanced warning box with criminal penalties notice

---

## User Experience Flow

### For New Users (Signup)
1. Fill in signup form
2. Must check "I agree to Terms of Service and Privacy Policy"
3. Can click links to read full documents
4. Submit button only enabled when checkbox is checked
5. Consent timestamp saved to database

### For Existing Users
- Existing users not affected (grandfather clause)
- Optional: Show terms update banner if terms version changes

### For Guests
- Small notice text above email generator
- Implicit consent by using the service

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/` | Add `terms_accepted_at` column to profiles |
| `src/pages/Auth.tsx` | Add checkbox, validation, consent saving |
| `src/components/EmailGenerator.tsx` | Add small terms notice for guests |
| Database: `page_content` | Update TOS with cybercrime sections |
| Database: `page_content` | Update Privacy Policy with security logging |

---

## Security Clauses to Add (Summary)

**Explicitly Prohibited:**
- Hacking, cracking, penetration testing without authorization
- Carding, credit card fraud, BIN checking
- Phishing campaigns, credential harvesting
- Identity theft, impersonation
- Malware, ransomware, spyware distribution
- DDoS attacks, botnet operations
- Dark web marketplace activities
- Cryptocurrency scams, pump-and-dump schemes
- Social engineering attacks
- Exploiting zero-day vulnerabilities
- Unauthorized data scraping or harvesting

**Legal Warnings:**
- Criminal referral to law enforcement
- Full cooperation with cybercrime units
- IP and activity logging for investigations
- User liable for all damages and legal fees
