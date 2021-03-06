# 2.3.0

* Add command-line help with “flourish help”.
* “flourish delete” now takes a template id, not a template directory.

# 2.2.0

* Cross-platform compatibility improvements: it should now work correctly on
	Windows, Mac and Linux.
* Run “`npm update`” on build if `package.json` exists but `node_modules` does not
* Better error reporting if “`flourish upgrade`” is run and neither `template.yml`
  nor `settings.js` exist.
* “flourish whoami” prints your username, rather than your email address
* Remove top menu; "Preview" mode now available as "Standalone" via the view menu
* Legal nonsense:
	* Add license
	* Agree to Terms and Conditions when you register
* An unfortunate consequence of the previous point is that older versions of
	the SDK are no longer allowed to communicate with the server, and users are
	prompted to upgrade
* Use Handlebars rather than Mustache internally
* Dogfood note: our internal templates may specify `flourish/identifier` in their
	`id` field, so when we publish them they’re linked to the `flourish` user.
	This only works if you’re logged in as an admin user.

# 2.1.0

* Add an option (`--as`) that only works for admin users.
* Serve source maps (`template.js.map`) for easier debugging of templates.
* Correct documentation for data bindings. Issue a better error message
  for data bindings that don’t have suitable `column` or `columns` specifications.
  Thanks to Tim Brock.
* Add release notes!
* Fix the “Editor” link in the SDK header.
* Mention “flourish register” in the quickstart notes.
