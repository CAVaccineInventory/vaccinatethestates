<!--
    Replace this comment with a description of the change(s) being made.
    Screenshots are especially useful if you want to show how the site is changing.
    If relevant, try to reference Issue IDs that this PR resolves.
-->

<!--
    Replace the NNN in the URL below with the ID of this Pull Request.
    That's the URL where Netlify will automatically deploy a staging build.
-->
Link to Deploy Preview: https://deploy-preview-NNN--beta-vaccinatethestates.netlify.app/

---

### Manual Testing (QA)

_(Note: Use your best judgement for time management. If this PR is a minor content adjustment, you might not invest in the full list of QA checks below. But for medium-large PRs, we recommend a thorough review.)_

- [ ] I solemnly swear that I QA'd my change. My change does not break the site on `localhost` nor staging.

#### Home Page
- [ ] Geolocation works
- [ ] Searching by zip works
- [ ] Cards show useful information
  - [ ] Cards address links to Google Maps
  - [ ] Cards can be expanded
- [ ] Zooming out gets us back to blank slate text

#### About Us
- [ ] Organizers show up and randomize on page load
