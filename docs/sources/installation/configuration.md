+++
title = "Configuration"
description = "Configuration Docs"
keywords = ["grafana", "configuration", "documentation"]
type = "docs"
[menu.docs]
name = "Configuration"
identifier = "config"
parent = "admin"
weight = 1
+++

# Configuration

The Grafana back-end has a number of configuration options that can be
specified in a `.ini` configuration file or specified using environment variables.

> **Note.** Grafana needs to be restarted for any configuration changes to take effect.

## Comments In .ini Files

Semicolons (the `;` char) are the standard way to comment out lines in a `.ini` file.

A common problem is forgetting to uncomment a line in the `custom.ini` (or `grafana.ini`) file which causes the configuration option to be ignored.

## Config file locations

- Default configuration from `$WORKING_DIR/conf/defaults.ini`
- Custom configuration from `$WORKING_DIR/conf/custom.ini`
- The custom configuration file path can be overridden using the `--config` parameter

> **Note.** If you have installed Grafana using the `deb` or `rpm`
> packages, then your configuration file is located at
> `/etc/grafana/grafana.ini`. This path is specified in the Grafana
> init.d script using `--config` file parameter.

## Using environment variables

All options in the configuration file (listed below) can be overridden
using environment variables using the syntax:

```bash
GF_<SectionName>_<KeyName>
```

Where the section name is the text within the brackets. Everything
should be upper case, `.` should be replaced by `_`. For example, given these configuration settings:

```bash
# default section
instance_name = ${HOSTNAME}

[security]
admin_user = admin

[auth.google]
client_secret = 0ldS3cretKey
```

Then you can override them using:

```bash
export GF_DEFAULT_INSTANCE_NAME=my-instance
export GF_SECURITY_ADMIN_USER=true
export GF_AUTH_GOOGLE_CLIENT_SECRET=newS3cretKey
```

<hr />

## instance_name

Set the name of the grafana-server instance. Used in logging and internal metrics and in
clustering info. Defaults to: `${HOSTNAME}`, which will be replaced with
environment variable `HOSTNAME`, if that is empty or does not exist Grafana will try to use
system calls to get the machine name.

## [paths]

### data

Path to where Grafana stores the sqlite3 database (if used), file based
sessions (if used), and other data.  This path is usually specified via
command line in the init.d script or the systemd service file.

### temp_data_lifetime

How long temporary images in `data` directory should be kept. Defaults to: `24h`. Supported modifiers: `h` (hours),
`m` (minutes), for example: `168h`, `30m`, `10h30m`. Use `0` to never clean up temporary files.

### logs

Path to where Grafana will store logs. This path is usually specified via
command line in the init.d script or the systemd service file.  It can
be overridden in the configuration file or in the default environment variable
file.

### plugins

Directory where grafana will automatically scan and look for plugins

### provisioning

Folder that contains [provisioning](/administration/provisioning) config files that grafana will apply on startup. Dashboards will be reloaded when the json files changes

## [server]

### http_addr

The IP address to bind to. If empty will bind to all interfaces

### http_port

The port to bind to, defaults to `3000`. To use port 80 you need to
either give the Grafana binary permission for example:

```bash
$ sudo setcap 'cap_net_bind_service=+ep' /usr/sbin/grafana-server
```

Or redirect port 80 to the Grafana port using:

```bash
$ sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
```

Another way is put a webserver like Nginx or Apache in front of Grafana and have them proxy requests to Grafana.

### protocol

`http` or `https`

> **Note** Grafana versions earlier than 3.0 are vulnerable to [POODLE](https://en.wikipedia.org/wiki/POODLE). So we strongly recommend to upgrade to 3.x or use a reverse proxy for ssl termination.

### domain

This setting is only used in as a part of the `root_url` setting (see below). Important if you
use GitHub or Google OAuth.

### enforce_domain

Redirect to correct domain if host header does not match domain.
Prevents DNS rebinding attacks. Default is false.

### root_url

This is the full URL used to access Grafana from a web browser. This is
important if you use Google or GitHub OAuth authentication (for the
callback URL to be correct).

> **Note** This setting is also important if you have a reverse proxy
> in front of Grafana that exposes it through a subpath. In that
> case add the subpath to the end of this URL setting.

### static_root_path

The path to the directory where the front end files (HTML, JS, and CSS
files). Default to `public` which is why the Grafana binary needs to be
executed with working directory set to the installation path.

### cert_file

Path to the certificate file (if `protocol` is set to `https`).

### cert_key

Path to the certificate key file (if `protocol` is set to `https`).

### router_logging

Set to true for Grafana to log all HTTP requests (not just errors). These are logged as Info level events
to grafana log.
<hr />

<hr />

## [database]

Grafana needs a database to store users and dashboards (and other
things). By default it is configured to use `sqlite3` which is an
embedded database (included in the main Grafana binary).

### url

Use either URL or the other fields below to configure the database
Example: `mysql://user:secret@host:port/database`

### type

Either `mysql`, `postgres` or `sqlite3`, it's your choice.

### path

Only applicable for `sqlite3` database. The file path where the database
will be stored.

### host

Only applicable to MySQL or Postgres. Includes IP or hostname and port or in case of unix sockets the path to it.
For example, for MySQL running on the same host as Grafana: `host =
127.0.0.1:3306` or with unix sockets: `host = /var/run/mysqld/mysqld.sock`

### name

The name of the Grafana database. Leave it set to `grafana` or some
other name.

### user

The database user (not applicable for `sqlite3`).

### password

The database user's password (not applicable for `sqlite3`). If the password contains `#` or `;` you have to wrap it with triple quotes. Ex `"""#password;"""`

### ssl_mode

For Postgres, use either `disable`, `require` or `verify-full`.
For MySQL, use either `true`, `false`, or `skip-verify`.

### ca_cert_path

The path to the CA certificate to use. On many linux systems, certs can be found in `/etc/ssl/certs`.

### client_key_path

The path to the client key. Only if server requires client authentication.

### client_cert_path

The path to the client cert. Only if server requires client authentication.

### server_cert_name

The common name field of the certificate used by the `mysql` or `postgres` server. Not necessary if `ssl_mode` is set to `skip-verify`.

### max_idle_conn
The maximum number of connections in the idle connection pool.

### max_open_conn
The maximum number of open connections to the database.

### conn_max_lifetime

Sets the maximum amount of time a connection may be reused. The default is 14400 (which means 14400 seconds or 4 hours). For MySQL, this setting should be shorter than the [`wait_timeout`](https://dev.mysql.com/doc/refman/5.7/en/server-system-variables.html#sysvar_wait_timeout) variable.

### log_queries

Set to `true` to log the sql calls and execution times.

<hr />

## [security]

### admin_user

The name of the default Grafana admin user (who has full permissions).
Defaults to `admin`.

### admin_password

The password of the default Grafana admin. Set once on first-run.  Defaults to `admin`.

### login_remember_days

The number of days the keep me logged in / remember me cookie lasts.

### secret_key

Used for signing some datasource settings like secrets and passwords. Cannot be changed without requiring an update
to datasource settings to re-encode them.

### disable_gravatar

Set to `true` to disable the use of Gravatar for user profile images.
Default is `false`.

### data_source_proxy_whitelist

Define a white list of allowed ips/domains to use in data sources. Format: `ip_or_domain:port` separated by spaces

<hr />

## [users]

### allow_sign_up

Set to `false` to prohibit users from being able to sign up / create
user accounts. Defaults to `false`.  The admin user can still create
users from the [Grafana Admin Pages](../../reference/admin)

### allow_org_create

Set to `false` to prohibit users from creating new organizations.
Defaults to `false`.

### auto_assign_org

Set to `true` to automatically add new users to the main organization
(id 1). When set to `false`, new users will automatically cause a new
organization to be created for that new user.

### auto_assign_org_id

Set this value to automatically add new users to the provided org.
This requires `auto_assign_org` to be set to `true`. Please make sure
that this organization does already exists.

### auto_assign_org_role

The role new users will be assigned for the main organization (if the
above setting is set to true).  Defaults to `Viewer`, other valid
options are `Admin` and `Editor`. e.g. :

`auto_assign_org_role = Viewer`

### viewers_can_edit

Viewers can edit/inspect dashboard settings in the browser. But not save the dashboard.
Defaults to `false`.

<hr>

## [auth]

### disable_login_form

Set to true to disable (hide) the login form, useful if you use OAuth, defaults to false.

### disable_signout_menu

Set to true to disable the signout link in the side menu. useful if you use auth.proxy, defaults to false.

<hr>

## [auth.anonymous]

### enabled

Set to `true` to enable anonymous access. Defaults to `false`

### org_name

Set the organization name that should be used for anonymous users. If
you change your organization name in the Grafana UI this setting needs
to be updated to match the new name.

### org_role

Specify role for anonymous users. Defaults to `Viewer`, other valid
options are `Editor` and `Admin`.

## [auth.github]

You need to create a GitHub OAuth application (you find this under the GitHub
settings page). When you create the application you will need to specify
a callback URL. Specify this as callback:

```bash
http://<my_grafana_server_name_or_ip>:<grafana_server_port>/login/github
```

This callback URL must match the full HTTP address that you use in your
browser to access Grafana, but with the prefix path of `/login/github`.
When the GitHub OAuth application is created you will get a Client ID and a
Client Secret. Specify these in the Grafana configuration file. For
example:

```bash
[auth.github]
enabled = true
allow_sign_up = true
client_id = YOUR_GITHUB_APP_CLIENT_ID
client_secret = YOUR_GITHUB_APP_CLIENT_SECRET
scopes = user:email,read:org
auth_url = https://github.com/login/oauth/authorize
token_url = https://github.com/login/oauth/access_token
api_url = https://api.github.com/user
team_ids =
allowed_organizations =
```

Restart the Grafana back-end. You should now see a GitHub login button
on the login page. You can now login or sign up with your GitHub
accounts.

You may allow users to sign-up via GitHub authentication by setting the
`allow_sign_up` option to `true`. When this option is set to `true`, any
user successfully authenticating via GitHub authentication will be
automatically signed up.

### team_ids

Require an active team membership for at least one of the given teams on
GitHub. If the authenticated user isn't a member of at least one of the
teams they will not be able to register or authenticate with your
Grafana instance. For example:

```bash
[auth.github]
enabled = true
client_id = YOUR_GITHUB_APP_CLIENT_ID
client_secret = YOUR_GITHUB_APP_CLIENT_SECRET
scopes = user:email,read:org
team_ids = 150,300
auth_url = https://github.com/login/oauth/authorize
token_url = https://github.com/login/oauth/access_token
api_url = https://api.github.com/user
allow_sign_up = true
```

### allowed_organizations

Require an active organization membership for at least one of the given
organizations on GitHub. If the authenticated user isn't a member of at least
one of the organizations they will not be able to register or authenticate with
your Grafana instance. For example

```bash
[auth.github]
enabled = true
client_id = YOUR_GITHUB_APP_CLIENT_ID
client_secret = YOUR_GITHUB_APP_CLIENT_SECRET
scopes = user:email,read:org
auth_url = https://github.com/login/oauth/authorize
token_url = https://github.com/login/oauth/access_token
api_url = https://api.github.com/user
allow_sign_up = true
# space-delimited organization names
allowed_organizations = github google
```

<hr>

## [auth.gitlab]

> Only available in Grafana v5.3+.

You need to [create a GitLab OAuth
application](https://docs.gitlab.com/ce/integration/oauth_provider.html).
Choose a descriptive *Name*, and use the following *Redirect URI*:

```
https://grafana.example.com/login/gitlab
```

where `https://grafana.example.com` is the URL you use to connect to Grafana.
Adjust it as needed if you don't use HTTPS or if you use a different port; for
instance, if you access Grafana at `http://203.0.113.31:3000`, you should use

```
http://203.0.113.31:3000/login/gitlab
```

Finally, select *api* as the *Scope* and submit the form. Note that if you're
not going to use GitLab groups for authorization (i.e. not setting
`allowed_groups`, see below), you can select *read_user* instead of *api* as
the *Scope*, thus giving a more restricted access to your GitLab API.

You'll get an *Application Id* and a *Secret* in return; we'll call them
`GITLAB_APPLICATION_ID` and `GITLAB_SECRET` respectively for the rest of this
section.

Add the following to your Grafana configuration file to enable GitLab
authentication:

```ini
[auth.gitlab]
enabled = false
allow_sign_up = false
client_id = GITLAB_APPLICATION_ID
client_secret = GITLAB_SECRET
scopes = api
auth_url = https://gitlab.com/oauth/authorize
token_url = https://gitlab.com/oauth/token
api_url = https://gitlab.com/api/v4
allowed_groups =
```

Restart the Grafana backend for your changes to take effect.

If you use your own instance of GitLab instead of `gitlab.com`, adjust
`auth_url`, `token_url` and `api_url` accordingly by replacing the `gitlab.com`
hostname with your own.

With `allow_sign_up` set to `false`, only existing users will be able to login
using their GitLab account, but with `allow_sign_up` set to `true`, *any* user
who can authenticate on GitLab will be able to login on your Grafana instance;
if you use the public `gitlab.com`, it means anyone in the world would be able
to login on your Grafana instance.

You can can however limit access to only members of a given group or list of
groups by setting the `allowed_groups` option.

### allowed_groups

To limit access to authenticated users that are members of one or more [GitLab
groups](https://docs.gitlab.com/ce/user/group/index.html), set `allowed_groups`
to a comma- or space-separated list of groups. For instance, if you want to
only give access to members of the `example` group, set


```ini
allowed_groups = example
```

If you want to also give access to members of the subgroup `bar`, which is in
the group `foo`, set

```ini
allowed_groups = example, foo/bar
```

Note that in GitLab, the group or subgroup name doesn't always match its
display name, especially if the display name contains spaces or special
characters. Make sure you always use the group or subgroup name as it appears
in the URL of the group or subgroup.

Here's a complete example with `alloed_sign_up` enabled, and access limited to
the `example` and `foo/bar` groups:

```ini
[auth.gitlab]
enabled = false
allow_sign_up = true
client_id = GITLAB_APPLICATION_ID
client_secret = GITLAB_SECRET
scopes = api
auth_url = https://gitlab.com/oauth/authorize
token_url = https://gitlab.com/oauth/token
api_url = https://gitlab.com/api/v4
allowed_groups = example, foo/bar
```

<hr>

## [auth.google]

First, you need to create a Google OAuth Client:

1. Go to https://console.developers.google.com/apis/credentials

2. Click the 'Create Credentials' button, then click 'OAuth Client ID' in the
menu that drops down

3. Enter the following:

   - Application Type: Web Application
   - Name: Grafana
   - Authorized Javascript Origins: https://grafana.mycompany.com
   - Authorized Redirect URLs: https://grafana.mycompany.com/login/google

   Replace https://grafana.mycompany.com with the URL of your Grafana instance.

4. Click Create

5. Copy the Client ID and Client Secret from the 'OAuth Client' modal

Specify the Client ID and Secret in the Grafana configuration file. For example:

```bash
[auth.google]
enabled = true
client_id = CLIENT_ID
client_secret = CLIENT_SECRET
scopes = https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email
auth_url = https://accounts.google.com/o/oauth2/auth
token_url = https://accounts.google.com/o/oauth2/token
allowed_domains = mycompany.com mycompany.org
allow_sign_up = true
```

Restart the Grafana back-end. You should now see a Google login button
on the login page. You can now login or sign up with your Google
accounts. The `allowed_domains` option is optional, and domains were separated by space.

You may allow users to sign-up via Google authentication by setting the
`allow_sign_up` option to `true`. When this option is set to `true`, any
user successfully authenticating via Google authentication will be
automatically signed up.

## [auth.generic_oauth]

This option could be used if have your own oauth service.

This callback URL must match the full HTTP address that you use in your
browser to access Grafana, but with the prefix path of `/login/generic_oauth`.

```bash
[auth.generic_oauth]
enabled = true
client_id = YOUR_APP_CLIENT_ID
client_secret = YOUR_APP_CLIENT_SECRET
scopes =
auth_url =
token_url =
api_url =
allowed_domains = mycompany.com mycompany.org
allow_sign_up = true
```

Set api_url to the resource that returns [OpenID UserInfo](https://connect2id.com/products/server/docs/api/userinfo) compatible information.

### Set up oauth2 with Okta

First set up Grafana as an OpenId client "webapplication" in Okta. Then set the Base URIs to `https://<grafana domain>/` and set the Login redirect URIs to `https://<grafana domain>/login/generic_oauth`.

Finally set up the generic oauth module like this:
```bash
[auth.generic_oauth]
name = Okta
enabled = true
scopes = openid profile email
client_id = <okta application Client ID>
client_secret = <okta application Client Secret>
auth_url = https://<okta domain>/oauth2/v1/authorize
token_url = https://<okta domain>/oauth2/v1/token
api_url = https://<okta domain>/oauth2/v1/userinfo
```

### Set up oauth2 with Bitbucket

```bash
[auth.generic_oauth]
name = BitBucket
enabled = true
allow_sign_up = true
client_id = <client id>
client_secret = <client secret>
scopes = account email
auth_url = https://bitbucket.org/site/oauth2/authorize
token_url = https://bitbucket.org/site/oauth2/access_token
api_url = https://api.bitbucket.org/2.0/user
team_ids =
allowed_organizations =
```

### Set up oauth2 with OneLogin

1.  Create a new Custom Connector with the following settings:
    - Name: Grafana
    - Sign On Method: OpenID Connect
    - Redirect URI: `https://<grafana domain>/login/generic_oauth`
    - Signing Algorithm: RS256
    - Login URL: `https://<grafana domain>/login/generic_oauth`

    then:
2.  Add an App to the Grafana Connector:
    - Display Name: Grafana

    then:
3.  Under the SSO tab on the Grafana App details page you'll find the Client ID and Client Secret.

    Your OneLogin Domain will match the url you use to access OneLogin.

    Configure Grafana as follows:

    ```bash
    [auth.generic_oauth]
    name = OneLogin
    enabled = true
    allow_sign_up = true
    client_id = <client id>
    client_secret = <client secret>
    scopes = openid email name
    auth_url = https://<onelogin domain>.onelogin.com/oidc/auth
    token_url = https://<onelogin domain>.onelogin.com/oidc/token
    api_url = https://<onelogin domain>.onelogin.com/oidc/me
    team_ids =
    allowed_organizations =
    ```

### Set up oauth2 with Auth0

1.  Create a new Client in Auth0
    - Name: Grafana
    - Type: Regular Web Application

2.  Go to the Settings tab and set:
    - Allowed Callback URLs: `https://<grafana domain>/login/generic_oauth`

3. Click Save Changes, then use the values at the top of the page to configure Grafana:

    ```bash
    [auth.generic_oauth]
    enabled = true
    allow_sign_up = true
    team_ids =
    allowed_organizations =
    name = Auth0
    client_id = <client id>
    client_secret = <client secret>
    scopes = openid profile email
    auth_url = https://<domain>/authorize
    token_url = https://<domain>/oauth/token
    api_url = https://<domain>/userinfo
    ```

### Set up oauth2 with Azure Active Directory

1.  Log in to portal.azure.com and click "Azure Active Directory" in the side menu, then click the "Properties" sub-menu item.

2.  Copy the "Directory ID", this is needed for setting URLs later

3.  Click "App Registrations" and add a new application registration:
    - Name: Grafana
    - Application type: Web app / API
    - Sign-on URL: `https://<grafana domain>/login/generic_oauth`

4.  Click the name of the new application to open the application details page.

5.  Note down the "Application ID", this will be the OAuth client id.

6.  Click "Settings", then click "Keys" and add a new entry under Passwords
    - Key Description: Grafana OAuth
    - Duration: Never Expires

7.  Click Save then copy the key value, this will be the OAuth client secret.

8.  Configure Grafana as follows:

    ```bash
    [auth.generic_oauth]
    name = Azure AD
    enabled = true
    allow_sign_up = true
    client_id = <application id>
    client_secret = <key value>
    scopes = openid email name
    auth_url = https://login.microsoftonline.com/<directory id>/oauth2/authorize
    token_url = https://login.microsoftonline.com/<directory id>/oauth2/token
    api_url =
    team_ids =
    allowed_organizations =
    ```

<hr>

## [auth.basic]
### enabled
When enabled is `true` (default) the http api will accept basic authentication.

<hr>

## [auth.ldap]
### enabled
Set to `true` to enable LDAP integration (default: `false`)

### config_file
Path to the LDAP specific configuration file (default: `/etc/grafana/ldap.toml`)

### allow_sign_up

Allow sign up should almost always be true (default) to allow new Grafana users to be created (if ldap authentication is ok). If set to
false only pre-existing Grafana users will be able to login (if ldap authentication is ok).

> For details on LDAP Configuration, go to the [LDAP Integration]({{< relref "ldap.md" >}}) page.

<hr>

## [auth.proxy]

This feature allows you to handle authentication in a http reverse proxy.

### enabled

Defaults to `false`

### header_name

Defaults to X-WEBAUTH-USER

#### header_property

Defaults to username but can also be set to email

### auto_sign_up

Set to `true` to enable auto sign up of users who do not exist in Grafana DB. Defaults to `true`.

### whitelist

Limit where auth proxy requests come from by configuring a list of IP addresses. This can be used to prevent users spoofing the X-WEBAUTH-USER header.

### headers

Used to define additional headers for `Name`, `Email` and/or `Login`, for example if the user's name is sent in the X-WEBAUTH-NAME header and their email address in the X-WEBAUTH-EMAIL header, set `headers = Name:X-WEBAUTH-NAME Email:X-WEBAUTH-EMAIL`.

<hr>

## [session]

### provider

Valid values are `memory`, `file`, `mysql`, `postgres`, `memcache` or `redis`. Default is `file`.

### provider_config

This option should be configured differently depending on what type of
session provider you have configured.

- **file:** session file path, e.g. `data/sessions`
- **mysql:** go-sql-driver/mysql dsn config string, e.g. `user:password@tcp(127.0.0.1:3306)/database_name`
- **postgres:** ex:  `user=a password=b host=localhost port=5432 dbname=c sslmode=verify-full`
- **memcache:** ex:  `127.0.0.1:11211`
- **redis:** ex: `addr=127.0.0.1:6379,pool_size=100,prefix=grafana`. For unix socket, use for example: `network=unix,addr=/var/run/redis/redis.sock,pool_size=100,db=grafana`

Postgres valid `sslmode` are `disable`, `require`, `verify-ca`, and `verify-full` (default).

### cookie_name

The name of the Grafana session cookie.

### cookie_secure

Set to true if you host Grafana behind HTTPS only. Defaults to `false`.

### session_life_time

How long sessions lasts in seconds. Defaults to `86400` (24 hours).

<hr />

## [analytics]

### reporting_enabled

When enabled Grafana will send anonymous usage statistics to
`stats.grafana.org`. No IP addresses are being tracked, only simple counters to
track running instances, versions, dashboard & error counts. It is very helpful
to us, so please leave this enabled. Counters are sent every 24 hours. Default
value is `true`.

### google_analytics_ua_id

If you want to track Grafana usage via Google analytics specify *your* Universal
Analytics ID here. By default this feature is disabled.

<hr />

## [dashboards]

### versions_to_keep

Number dashboard versions to keep (per dashboard). Default: 20, Minimum: 1.

## [dashboards.json]

> This have been replaced with dashboards [provisioning](/administration/provisioning) in 5.0+

### enabled
`true` or `false`. Is disabled by default.

### path
The full path to a directory containing your json dashboards.

## [smtp]
Email server settings.

### enabled
defaults to false

### host
defaults to localhost:25

### user
In case of SMTP auth, defaults to `empty`

### password
In case of SMTP auth, defaults to `empty`

### cert_file
File path to a cert file, defaults to `empty`

### key_file
File path to a key file, defaults to `empty`

### skip_verify
Verify SSL for smtp server? defaults to `false`

### from_address
Address used when sending out emails, defaults to `admin@grafana.localhost`

### from_name
Name to be used when sending out emails, defaults to `Grafana`

### ehlo_identity
Name to be used as client identity for EHLO in SMTP dialog, defaults to instance_name.

## [log]

### mode
Either "console", "file", "syslog". Default is console and  file
Use space to separate multiple modes, e.g. "console file"

### level
Either "debug", "info", "warn", "error", "critical", default is "info"

### filters
optional settings to set different levels for specific loggers.
Ex `filters = sqlstore:debug`

## [metrics]

### enabled
Enable metrics reporting. defaults true. Available via HTTP API `/metrics`.

### interval_seconds

Flush/Write interval when sending metrics to external TSDB. Defaults to 10s.

## [metrics.graphite]
Include this section if you want to send internal Grafana metrics to Graphite.

### address
Format `<Hostname or ip>`:port

### prefix
Graphite metric prefix. Defaults to `prod.grafana.%(instance_name)s.`

## [snapshots]

### external_enabled
Set to false to disable external snapshot publish endpoint (default true)

### external_snapshot_url
Set root url to a Grafana instance where you want to publish external snapshots (defaults to https://snapshots-origin.raintank.io)

### external_snapshot_name
Set name for external snapshot button. Defaults to `Publish to snapshot.raintank.io`

### snapshot_remove_expired
Enabled to automatically remove expired snapshots

## [external_image_storage]
These options control how images should be made public so they can be shared on services like slack.

### provider
You can choose between (s3, webdav, gcs, azure_blob, local). If left empty Grafana will ignore the upload action.

## [external_image_storage.s3]

### bucket
Bucket name for S3. e.g. grafana.snapshot

### region
Region name for S3. e.g. 'us-east-1', 'cn-north-1', etc

### path
Optional extra path inside bucket, useful to apply expiration policies

### bucket_url
(for backward compatibility, only works when no bucket or region are configured)
Bucket URL for S3. AWS region can be specified within URL or defaults to 'us-east-1', e.g.
- http://grafana.s3.amazonaws.com/
- https://grafana.s3-ap-southeast-2.amazonaws.com/

### access_key
Access key. e.g. AAAAAAAAAAAAAAAAAAAA

Access key requires permissions to the S3 bucket for the 's3:PutObject' and 's3:PutObjectAcl' actions.

### secret_key
Secret key. e.g. AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

## [external_image_storage.webdav]

### url
Url to where Grafana will send PUT request with images

### public_url
Optional parameter. Url to send to users in notifications. If the string contains the sequence ${file}, it will be replaced with the uploaded filename. Otherwise, the file name will be appended to the path part of the url, leaving any query string unchanged.

### username
basic auth username

### password
basic auth password

## [external_image_storage.gcs]

### key_file
Path to JSON key file associated with a Google service account to authenticate and authorize.
Service Account keys can be created and downloaded from https://console.developers.google.com/permissions/serviceaccounts.

Service Account should have "Storage Object Writer" role.

### bucket name
Bucket Name on Google Cloud Storage.

### path
Optional extra path inside bucket

## [external_image_storage.azure_blob]

### account_name
Storage account name

### account_key
Storage account key

### container_name
Container name where to store "Blob" images with random names. Creating the blob container beforehand is required. Only public containers are supported.

## [alerting]

### enabled
Defaults to true. Set to false to disable alerting engine and hide Alerting from UI.

### execute_alerts

Makes it possible to turn off alert rule execution.
