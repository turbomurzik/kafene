# Discourse provisioning notes — infrastructure task 1

These notes reproduce the disposable instance provisioned on 2026-10-02. They
cover infrastructure task 1 only. No KAFENE fixtures, AI providers, embeddings,
retrieval evaluation, bridge/orchestrator code, or architecture decision were
configured or executed.

## Result

| Item | Verified value |
|---|---|
| Cloud project | `kafene-discourse-20261002` |
| VM | `kafene-discourse-spike`, `europe-west1-b` |
| Public IPv4 | `34.156.242.215` (reserved static address) |
| Hostname | `kafene-34-156-242-215.sslip.io` |
| URL | https://kafene-34-156-242-215.sslip.io/ |
| OS | Ubuntu `24.04.5 LTS`, kernel `7.0.0-1011-gcp` |
| Capacity | 2 vCPU, 8 GB RAM, 30 GB `pd-balanced` disk |
| Docker | Docker Engine Community `29.8.2` client/server |
| Discourse | `2026.10.0-latest`, commit `67bc74d0d83f8037ec538c1299b8d8cb59211319`, channel `latest` |
| Container base | `discourse/base:2.0.20260915-0028` |
| Database | PostgreSQL `18.6` (`Debian 18.6-1.pgdg13+2`) |
| HTTPS | Let's Encrypt certificate valid; HTTP `301` to HTTPS; HTTPS `200` |
| SMTP | Not configured; `DISCOURSE_SKIP_EMAIL_SETUP=1` |
| Backup | Supported CLI backup succeeded; 2,919,636-byte archive |
| Restore | Not tested |

The hostname uses the public `sslip.io` wildcard DNS service and therefore
depends on that service continuing to resolve the embedded IPv4 address.

## Provision the isolated host

The commands below describe the resources used for this run. A different run
must use a globally unique project ID and may receive a different public IP.
Link a billing account to the new project before enabling Compute Engine; do
not put its identifier in the repository.

```bash
export PROJECT_ID="kafene-discourse-20261002"
export REGION="europe-west1"
export ZONE="europe-west1-b"
export INSTANCE="kafene-discourse-spike"
export ADDRESS="kafene-discourse-ip"

gcloud projects create "$PROJECT_ID" --name="KAFENE Discourse Spike"
gcloud billing projects link "$PROJECT_ID" --billing-account="<billing-account-id>"
gcloud services enable compute.googleapis.com --project="$PROJECT_ID"

gcloud compute addresses create "$ADDRESS" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --network-tier=PREMIUM

export STATIC_IP="$(gcloud compute addresses describe "$ADDRESS" \
  --project="$PROJECT_ID" \
  --region="$REGION" \
  --format='value(address)')"

gcloud compute firewall-rules create kafene-discourse-web \
  --project="$PROJECT_ID" \
  --network=default \
  --allow=tcp:80,tcp:443 \
  --target-tags=discourse-web

gcloud compute instances create "$INSTANCE" \
  --project="$PROJECT_ID" \
  --zone="$ZONE" \
  --machine-type=e2-standard-2 \
  --network-interface="network-tier=PREMIUM,address=${STATIC_IP}" \
  --tags=discourse-web \
  --image-family=ubuntu-2404-lts-amd64 \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-balanced

export DISCOURSE_HOSTNAME="kafene-${STATIC_IP//./-}.sslip.io"
```

No existing project, host, network, or application was modified for this run.

## Install by the supported Discourse path

SSH to the fresh VM and run the current official installer:

```bash
wget -qO- https://raw.githubusercontent.com/discourse/discourse_docker/main/install-discourse | sudo bash
```

The completed wizard choices for this run were:

- own domain: yes;
- hostname: `kafene-34-156-242-215.sslip.io`;
- SMTP: no;
- release channel: `latest`;
- SSL and Let's Encrypt templates: enabled by the generated `app.yml`.

The successful build was performed with the official generated configuration:

```bash
cd /var/discourse
sudo ./discourse-setup --skip-rebuild
sudo ./launcher rebuild app
```

No custom Docker Compose file and no Discourse core edits were used.

Because choosing no SMTP caused this installer run to set local logins off,
local password authentication was explicitly enabled for the required login
test:

```bash
sudo docker exec \
  --user discourse \
  --env RAILS_ENV=production \
  --workdir /var/www/discourse \
  app bundle exec rails runner \
  "SiteSetting.enable_local_logins = true; raise unless SiteSetting.enable_local_logins"
```

SMTP remained disabled.

## Create test identities without recording secrets

Create the administrator through the supported Rake task. Enter a synthetic
email address and a generated password at the prompts:

```bash
sudo docker exec \
  --interactive --tty \
  --user discourse \
  --env RAILS_ENV=production \
  --workdir /var/www/discourse \
  app bundle exec rake admin:create
```

The generated administrator username in this run was `user2`. The active
normal user was `spike_user`.

Generate a master test API key and keep it in a root-only file, not in shell
history or the repository:

```bash
sudo sh -c 'umask 077; docker exec --user discourse --env RAILS_ENV=production --workdir /var/www/discourse app bundle exec rake "api_key:create_master[KAFENE provisioning smoke test]" > /root/kafene-api-key'
```

Passwords and the API key used for this run exist only in mode-`0600` files
under `/root` on the disposable VM. Their values were never added to Git.

## REST API smoke test

The following endpoint sequence was run with the master key. Values shown are
synthetic test data; substitute secret values through environment variables.

```bash
export DISCOURSE_BASE_URL="https://kafene-34-156-242-215.sslip.io"
export DISCOURSE_API_USERNAME="user2"
export DISCOURSE_API_KEY="<read from root-only storage>"
export TEST_USER_PASSWORD="<generated value>"

curl --fail-with-body --request POST "$DISCOURSE_BASE_URL/users.json" \
  --header "Api-Key: $DISCOURSE_API_KEY" \
  --header "Api-Username: $DISCOURSE_API_USERNAME" \
  --data-urlencode "name=KAFENE Test User" \
  --data-urlencode "email=spike-user@example.com" \
  --data-urlencode "username=spike_user" \
  --data-urlencode "password=$TEST_USER_PASSWORD" \
  --data-urlencode "active=true" \
  --data-urlencode "approved=true"

curl --fail-with-body --request POST "$DISCOURSE_BASE_URL/categories.json" \
  --header "Api-Key: $DISCOURSE_API_KEY" \
  --header "Api-Username: $DISCOURSE_API_USERNAME" \
  --data-urlencode "name=KAFENE Provisioning Smoke" \
  --data-urlencode "slug=kafene-provisioning-smoke" \
  --data-urlencode "color=0088CC" \
  --data-urlencode "text_color=FFFFFF"

curl --fail-with-body --request POST "$DISCOURSE_BASE_URL/posts.json" \
  --header "Api-Key: $DISCOURSE_API_KEY" \
  --header "Api-Username: spike_user" \
  --data-urlencode "title=KAFENE provisioning smoke topic" \
  --data-urlencode "raw=Created by the infrastructure task 1 REST API smoke test." \
  --data-urlencode "category=5"

curl --fail-with-body --request POST "$DISCOURSE_BASE_URL/posts.json" \
  --header "Api-Key: $DISCOURSE_API_KEY" \
  --header "Api-Username: $DISCOURSE_API_USERNAME" \
  --data-urlencode "topic_id=9" \
  --data-urlencode "raw=Reply created by the infrastructure task 1 REST API smoke test."

curl --fail-with-body \
  --header "Api-Key: $DISCOURSE_API_KEY" \
  --header "Api-Username: $DISCOURSE_API_USERNAME" \
  "$DISCOURSE_BASE_URL/t/9.json"
```

Observed results:

- site API: HTTP `200`;
- normal user creation: HTTP `200`, `success=true`, `active=true`;
- normal user read: HTTP `200`, username `spike_user`;
- category creation: HTTP `200`, category ID `5`;
- topic creation: HTTP `200`, topic ID `9`;
- reply creation: HTTP `200`;
- topic read: HTTP `200`, `posts_count=2`.

The administrator password-login flow was also exercised with a CSRF token
and cookie jar. `POST /session.json`, `GET /session/current.json`, and
`GET /admin/dashboard.json` each returned HTTP `200`; the current session
reported `username=user2`, `admin=true`, and `staff=true`.

## Version and health checks

```bash
sudo docker exec --user discourse --workdir /var/www/discourse \
  app git rev-parse HEAD
sudo docker exec --user discourse --env RAILS_ENV=production \
  --workdir /var/www/discourse app bundle exec rails runner \
  "puts Discourse::VERSION::STRING"
sudo docker exec app sv status /etc/service/nginx /etc/service/unicorn \
  /etc/service/postgres /etc/service/redis

curl --fail --output /dev/null \
  https://kafene-34-156-242-215.sslip.io/
```

The public UI loaded in a browser and showed the smoke-test topic and its one
reply. HTTPS certificate verification succeeded. Nginx, Unicorn, PostgreSQL,
and Redis were running.

## Backup and restore status

The supported backup command completed successfully:

```bash
sudo docker exec app discourse backup
```

It created:

```text
/var/www/discourse/public/backups/default/discourse-2026-10-02-103528-v20261001073226.tar.gz
```

The archive size was 2,919,636 bytes. Restore was deliberately not exercised
against the live verified instance, so restore remains **not tested** rather
than being inferred from backup success.

## Deferred scope

The bundled `discourse-ai` and `discourse-solved` directories are present in
the core checkout, but neither feature was configured or tested. Doc
Categories was not installed. No LLM, embedding definition, fixture corpus,
semantic retrieval evaluation, bridge, orchestrator, or ADR update was made.

## Teardown after the spike

The instance is intentionally still live. After all later spike tasks are
finished and evidence has been retained, the isolated project can be removed:

```bash
gcloud projects delete "kafene-discourse-20261002"
```

Project deletion is destructive and was not run as part of infrastructure
task 1.

## Official references

- https://github.com/discourse/discourse/blob/main/docs/INSTALL-cloud.md
- https://meta.discourse.org/t/self-hosting-discourse-just-got-a-whole-lot-easier/393915
