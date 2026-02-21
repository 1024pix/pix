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

docker_build(
    'pix-api',
    context='./api',
    dockerfile='./docker/dockerfiles/Dockerfile.hapi',
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
        'port': 4204,
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
        dockerfile='./docker/dockerfiles/Dockerfile.ember',
        build_args={
            'BUILD_ENVIRONMENT': 'production',
        },
    )

    k8s_resource(
        app['name'],
        labels=[app['label']],
        resource_deps=['api'],
        port_forwards=['{}:80'.format(app['port'])],
        links=[
            'http://{}.dev.pix.fr'.format(app['name']),
        ],
    )

