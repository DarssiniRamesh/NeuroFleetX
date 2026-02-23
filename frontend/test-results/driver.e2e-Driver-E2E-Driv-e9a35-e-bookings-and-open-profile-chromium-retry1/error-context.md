# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e6]: Create account
  - generic [ref=e7]:
    - generic [ref=e8]:
      - textbox "Full name" [ref=e9]: E2E Driver
      - textbox "Email" [ref=e10]: driver.1771830677426-5905@example.com
      - textbox "Password" [ref=e11]: Passw0rd!123
      - combobox [ref=e12]:
        - option "Admin"
        - option "Driver" [selected]
      - button "Register" [ref=e13] [cursor=pointer]
    - paragraph [ref=e14]:
      - text: Already registered?
      - link "Login" [ref=e15] [cursor=pointer]:
        - /url: /login
```