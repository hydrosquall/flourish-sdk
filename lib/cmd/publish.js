"use strict";

var fs = require("fs"),
    path = require("path"),

    archiver = require("archiver"),
    tmp = require("tmp"),
    yaml = require("js-yaml"),

    log = require("../log"),
    sdk = require("../sdk");

function zipUpTemplate(template_dir, config) {
	return new Promise(function(resolve, reject) {
		tmp.file(function(error, zip_filename, zip_fd) {
			if (error) return reject(error);

			let zip = archiver.create("zip", {});
			zip.on("error", function(error) {
				log.die(error);
			});

			let output = fs.createWriteStream(null, { fd: zip_fd });
			output.on("close", function() {
				resolve(zip_filename);
			});

			zip.pipe(output);

			zip.append(JSON.stringify({
				name: config.name,
				description: config.description,
				author: config.author
			}), { name: "metadata.json" });
			if (config.settings) zip.append(JSON.stringify(config.settings), { name: "settings.js" });
			if (config.data) zip.append(JSON.stringify(config.data), { name: "data.json" });

			for (let filename of sdk.TEMPLATE_SPECIAL_FILES) {
				if (filename == "template.yml") continue;
				let file_path = path.join(template_dir, filename);
				if (fs.existsSync(file_path)) {
					zip.file(file_path, { name: filename });
				}
			}
			for (let dirname of sdk.TEMPLATE_SPECIAL_DIRECTORIES) {
				let dir_path = path.join(template_dir, dirname);
				if (fs.existsSync(dir_path)) {
					zip.directory(dir_path, dirname);
				}
			}
			zip.finalize();
		});
	});
}

function uploadTemplate(server_opts, template_id, zip_filename) {
	return sdk.request(server_opts, "template/publish", {
		id: template_id,
		template: {
			value: fs.createReadStream(zip_filename),
			options: {
				filename: "template.zip",
				contentType: "application/zip",
			}
		}
	});
}

function publish(args, server_opts) {
	const template_dir = args._[1] || ".";

	sdk.buildTemplate(template_dir)
		.then(() => sdk.readAndValidateConfig(template_dir))
		.then((config) => {
			if (!config.id) log.die("The template’s template.yml doesn't have an id. Add one and try again.");

			log.success("Preparing template with id " + config.id + " for upload.");

			if (args.as && config.id.indexOf("/") > -1) {
				return Promise.reject(new Error("You can’t specify --as for a template that has a username in its id"));
			}
			const template_id = args.as ? args.as + "/" + config.id : config.id;

			return zipUpTemplate(template_dir, config)
				.then((zip_filename) => uploadTemplate(server_opts, template_id, zip_filename))
				.then(() => sdk.request(server_opts, "user/whoami", {}))
				.then((user_info) => {
					let protocol = "https";
					if (server_opts.host.match(/^(localhost|127\.0\.0\.1|.*\.local)(:\d+)?$/)) {
						protocol = "http";
					}

					let template_path;
					if (template_id.indexOf("/") > -1) {
						template_path = template_id;
					}
					else {
						template_path = user_info.username + "/" + template_id;
					}
					log.victory("Upload successful!",
						`Your template is available at ${protocol}://${server_opts.host}/@${template_path}`);
				});
		})
		.catch((error) => {
			if (args.debug) log.die("Failed to upload template", error.message, error.stack);
			else log.die("Failed to upload template", error.message);
		});
};

publish.help = `
flourish publish [directory_name]

Build and publish the template in the named directory, or in the current
directory if no directory is specified.

Before you publish a template, check that it has an “id” defined in template.yml
that you have not previously used. If you reuse an id from another template then
that template will be overwritten with this one.

You must be logged in to use this command. See “flourish login”.
`;

module.exports = publish;
