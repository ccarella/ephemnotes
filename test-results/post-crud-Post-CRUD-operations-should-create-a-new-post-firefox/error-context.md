# Page snapshot

```yaml
- navigation:
  - link "EphemNotes":
    - /url: /
  - button "Sign In"
- main:
  - heading "Create Post" [level=1]
  - paragraph: Share your ephemeral thought
  - main:
    - text: Title
    - textbox "Title": My Test Post
    - paragraph: 12/100 characters
    - text: Body
    - textbox "Body": This is a test post body that will disappear after 24 hours
    - paragraph: 59/1000 characters
    - button "Publish Post"
    - button "Cancel"
- alert
- button "Open Next.js Dev Tools":
  - img
```