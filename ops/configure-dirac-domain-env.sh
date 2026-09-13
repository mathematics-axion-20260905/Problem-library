#!/usr/bin/env bash
set -euo pipefail

replace_or_add() {
    local env_file="$1"
    local env_key="$2"
    local env_value="$3"

    if grep -q "^${env_key}=" "$env_file"; then
        sed -i "s|^${env_key}=.*|${env_key}=${env_value}|" "$env_file"
    else
        sed -i "1i${env_key}=${env_value}" "$env_file"
    fi
}

math_env=/root/projects/Mathematics-Frontend/.env.production
notebook_env=/root/projects/Notebook/.env.production
writer_env=/root/projects/Writer/.env.production
library_env=/root/projects/Problem-library/.env.production

replace_or_add "$math_env" NEXT_PUBLIC_API_URL https://math.dirac.space/api
replace_or_add "$math_env" INTERNAL_API_URL http://127.0.0.1:8008
replace_or_add "$notebook_env" NEXT_PUBLIC_API_URL https://notebook.dirac.space/api
replace_or_add "$notebook_env" INTERNAL_API_URL http://127.0.0.1:8006
replace_or_add "$writer_env" NEXT_PUBLIC_API_URL https://writer.dirac.space/api
replace_or_add "$writer_env" INTERNAL_API_URL http://127.0.0.1:8008
replace_or_add "$library_env" NEXT_PUBLIC_API_URL https://dirac.space/api
replace_or_add "$library_env" INTERNAL_API_URL http://127.0.0.1:8007

for env_file in "$math_env" "$notebook_env" "$writer_env" "$library_env"; do
    replace_or_add "$env_file" NEXT_PUBLIC_ECOSYSTEM_CORE_URL https://api.dirac.space/api
    replace_or_add "$env_file" NEXT_PUBLIC_SCIENCE_URL https://dirac.space/
    replace_or_add "$env_file" NEXT_PUBLIC_MATH_URL https://math.dirac.space/laboratory
    replace_or_add "$env_file" NEXT_PUBLIC_NOTEBOOK_URL https://notebook.dirac.space/workspace
    replace_or_add "$env_file" NEXT_PUBLIC_WRITER_URL https://writer.dirac.space/documents
    replace_or_add "$env_file" NEXT_PUBLIC_MATH_OBJECT_URL https://math.dirac.space/laboratory
    replace_or_add "$env_file" NEXT_PUBLIC_NOTEBOOK_OBJECT_URL https://notebook.dirac.space/workspace
    replace_or_add "$env_file" NEXT_PUBLIC_WRITER_OBJECT_URL https://writer.dirac.space/new
    replace_or_add "$env_file" NEXT_PUBLIC_SCIENCE_OBJECT_URL https://dirac.space/projects
done

allowed_hosts=localhost,127.0.0.1,169.58.123.200,dirac.space,www.dirac.space,library.dirac.space,math.dirac.space,notebook.dirac.space,writer.dirac.space,api.dirac.space,auth.dirac.space
browser_origins=http://169.58.123.200:3014,http://169.58.123.200:3015,http://169.58.123.200:3016,http://169.58.123.200:3017,https://dirac.space,https://www.dirac.space,https://library.dirac.space,https://math.dirac.space,https://notebook.dirac.space,https://writer.dirac.space

for env_file in /root/projects/Notebook/backend/.env /root/projects/Writer/backend/.env /root/projects/Problem-library/backend/.env; do
    replace_or_add "$env_file" DJANGO_ALLOWED_HOSTS "$allowed_hosts"
    replace_or_add "$env_file" DJANGO_CORS_ALLOWED_ORIGINS "$browser_origins"
    replace_or_add "$env_file" DJANGO_CSRF_TRUSTED_ORIGINS "$browser_origins"
    replace_or_add "$env_file" DJANGO_SECURE_SSL_REDIRECT true
done

echo "Domain environment configured"
