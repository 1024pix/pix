namespace = "pix"

# Allow deploying to the default kubernetes context
k8s_yaml('k8s/namespace.yaml')

k8s_yaml([
    'k8s/infrastructure/postgres.yaml',
    'k8s/infrastructure/redis.yaml',
    'k8s/infrastructure/s3-mock.yaml',
    'k8s/infrastructure/mailpit.yaml',
])

# Group infrastructure resources
k8s_resource('postgres', labels=['infrastructure'], port_forwards=['5432:5432'])
k8s_resource('redis', labels=['infrastructure'], port_forwards=['6379:6379'])
k8s_resource('s3-mock', labels=['infrastructure'])
k8s_resource('mailpit', labels=['infrastructure'])


k8s_yaml('k8s/routes/httproutes.yaml')


# =============================================================================
# API
# =============================================================================
k8s_yaml([
    'k8s/api/configmap.yaml',
    'k8s/api/secrets.yaml',
    'k8s/api/deployment.yaml',
])

# LCMS : par défaut, le LCMS minimal défini dans k8s/api/configmap.yaml.
# Si api/.env définit des variables LCMS_*, elles sont injectées dans le Secret
# api-lcms (non versionné) qui surcharge la configmap.
LCMS_ENV_KEYS = ['LCMS_API_URL', 'LCMS_API_KEY', 'LCMS_API_OAUTH_BASIC_TOKEN', 'LCMS_API_RELEASE_ID']

def read_dotenv(path, keys):
    values = {}
    if not os.path.exists(path):
        return values
    for line in str(read_file(path)).splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key in keys and value:
            values[key] = value
    return values

lcms_overrides = read_dotenv('api/.env', LCMS_ENV_KEYS)
k8s_yaml(encode_yaml({
    'apiVersion': 'v1',
    'kind': 'Secret',
    'metadata': {'name': 'api-lcms', 'namespace': namespace},
    'type': 'Opaque',
    'stringData': lcms_overrides,
}))
k8s_resource(
    objects=['api-lcms:secret'],
    new_name='api-lcms',
    labels=['backend'],
)

docker_build(
    'pix-api',
    context='./api',
    dockerfile='./k8s/dockerfiles/Dockerfile.hapi',
    # Ne pas embarquer les secrets locaux dans l'image
    ignore=['.env'],
)

k8s_resource(
    'api',
    labels=['backend'],
    resource_deps=['postgres', 'redis'],
    port_forwards=['3000:3000'],
)

# =============================================================================
# Frontend Applications
# =============================================================================

k8s_yaml([
    'k8s/frontends/nginx/configmap.yaml'
])

# Frontend apps configuration
frontend_apps = [
    {
        'name': 'app',
        'image': 'pix-mon-pix',
        'context': './mon-pix',
        'port': 4200,
        'label': 'frontend',
    },
    {
        'name': 'orga',
        'image': 'pix-orga',
        'context': './orga',
        'port': 4201,
        'label': 'frontend',
    },
    {
        'name': 'admin',
        'image': 'pix-admin',
        'context': './admin',
        'port': 4202,
        'label': 'frontend',
    },
    {
        'name': 'certif',
        'image': 'pix-certif',
        'context': './certif',
        'port': 4203,
        'label': 'frontend',
    },
    {
        'name': 'junior',
        'image': 'pix-junior',
        'context': './junior',
        'port': 4205,
        'label': 'frontend',
    },
]

for app in frontend_apps:
    # Load Kubernetes manifests
    k8s_yaml([
        'k8s/frontends/{}/configmap.yaml'.format(app['name']),
        'k8s/frontends/{}/deployment.yaml'.format(app['name']),
    ])

    docker_build(
        app['image'],
        context=app['context'],
        dockerfile='./k8s/dockerfiles/Dockerfile.ember',
        build_args={
            'BUILD_ENVIRONMENT': 'production',
        },
    )

    k8s_resource(
        app['name'],
        labels=[app['label']],
        port_forwards=['{}:80'.format(app['port'])],
        links=[
            'http://{}.dev.pix.fr'.format(app['name']),
        ],
    )


# =============================================================================
# Outils
# =============================================================================

local_resource(
    'db-seed',
    cmd='kubectl -n {} exec deploy/api -c api -- sh -c "npm run cache:refresh && npm run db:reload"'.format(namespace),
    resource_deps=['api'],
    labels=['tools'],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)
