#!/bin/bash -e

rm -rf ./tmp/pix.tar ./tmp/herokuenv ./tmp/herokuenvfile

# To avoid a slow copy over the Docker mount, we tar the sources
tar -cf tmp/pix.tar $(git ls-files)

APPLICATION_NAME=${APPLICATION_NAME:-mon-pix}

mkdir -p tmp/herokuenv
(
  cd tmp/herokuenv

  case "$APPLICATION_NAME" in
    mon-pix)
      echo mon-pix > APPLICATION_NAME
      echo pix-app-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo mon-pix > BUILDPACK_SUBDIR
      ;;
    orga)
      echo orga > APPLICATION_NAME
      echo pix-orga-local > APP
      echo production > NODE_ENV
      echo disabled > MAINTENANCE
      echo production > BUILD_ENVIRONMENT
      echo false > NPM_CONFIG_PRODUCTION
      echo orga > BUILDPACK_SUBDIR
      ;;
    api)
      echo api > APPLICATION_NAME
      echo pix-api-local > APP
      # Running in development env because production requires a postgres server
      echo development > NODE_ENV
      echo api > BUILDPACK_SUBDIR
      ;;
  esac

  echo pix_metrics_grafana_integration_215 > METRICS_DB_NAME
  echo RvEPDjBlKsDoDL0FFpms > METRICS_DB_PASSWORD
  echo https://db.metrics.integration.pix.fr > METRICS_DB_URL
  echo pix_metrics_grafana_integration_215 > METRICS_DB_USER
  echo > INFLUXDB_SSL_CA_CERT <<EOF
-----BEGIN CERTIFICATE-----
MIIFiTCCA3GgAwIBAgIBADANBgkqhkiG9w0BAQUFADBmMTEwLwYDVQQDDChTY2Fs
aW5nbyBEYXRhYmFzZXMgQ2VydGlmaWNhdGUgQXV0aG9yaXR5MQswCQYDVQQGEwJG
UjEPMA0GA1UECAwGQWxzYWNlMRMwEQYDVQQHDApTdHJhc2JvdXJnMB4XDTE3MDgw
MzA5NTc1NVoXDTM3MDcyOTA5NTc1NVowZjExMC8GA1UEAwwoU2NhbGluZ28gRGF0
YWJhc2VzIENlcnRpZmljYXRlIEF1dGhvcml0eTELMAkGA1UEBhMCRlIxDzANBgNV
BAgMBkFsc2FjZTETMBEGA1UEBwwKU3RyYXNib3VyZzCCAiIwDQYJKoZIhvcNAQEB
BQADggIPADCCAgoCggIBALXnBJG9j5hzAFDOSNp/zcu+HHfB1sXGq/BKBLNbUfZg
bEyjJOm9uFdMCl6toq9VL27vrS5bKAjhVlpbA93B+4MYc+BJmhdcIIrH6vNlF1LK
JIX5tWura3oHhYgD1q6/u2fq8/cFVZb3xRfHbm5a2oFj7dmsIBNPFz63/jOLS88F
DJKknYiDz+w/FWdoktWLlNZcWMmZtdrg0Quuc4ao3YMrfaKGk+0pkLeUCoWDaR8x
UNFfOxuvkdJAAfXcf/Br6ju+gk5YhyfDuGXGUi5jgQrZmm8R06VdXZb/65DXRblE
93kqcsy9oeEXu826W47w8qyfeecQgAHKqoYqlE74pqOM9/U+AU2oJWZ3AQZZYW+I
pJ/ZWILJFQ9A0AhELmzylHEOgR+Izn/wyOC3PLgs1h1Z++w07zF4/lQ9w33kQ2Vp
WrAQMf7ddaSravexPhfeBIhv2poSzgc8ABbG5c91MqCZPA8CV/GAkc3kSRsoynn4
XIT7L5ZVW48EcbHrW3SdQVa2EYbKwox3yJ8KJl4WHnKViwvRxm1vQwe6qfgu2Umo
z1M50LZvTmkFPcCc/wY3aE7W1V1Ni6EWDlONjdcGL8UIitxT+N1HkzbDz6GJkt8I
525Qua31xvfnnToOlfe1Sr/xzW9pH0u/dE6vN8Ow0ezfOKQ8pxibz/jGhebhURE1
AgMBAAGjQjBAMB0GA1UdDgQWBBT3BBxQJVT8WPLTibnP7974mknSjDAPBgNVHRMB
Af8EBTADAQH/MA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQUFAAOCAgEAcm0k
Bwqpo9y92mZd+oq/lod6E70xLGzAPud0FsZer1ynq5j0jGOQi1Fs6OaXbnp6ExjV
S7EhEyLPjfDUtFP6y4DrZc527LXB7j/obTcg8pr8U7+XPTwlGVDLlwWJUGcSCpT8
kV1CvBoQD1G21egNNfrx24w+h4z4tHq7M7nz1FPR0yxc/rcgyJeHKkpxKnLUpH9s
szCTP3esLTFxe3zcuJ8CozMN3lviqcTpJ9MxnjbLJkgAoGDd0Dp21BchNzhs5KKM
8OtBzUQ+vZCikSdeAGHHZeOraqijnI3lTAPqKR5y/SFk7baN8N3wcMD3PlNjcSnZ
9wDbwlB99/HpiHhbGGaOdQR2S+Y6xiGm5WSb0RwxWMHwpskNRFKpuDHX+OX5FF2s
Tdq3OpdPb8Bs0jnXNmiAV0JFdgbtFUK1EeRhUfegOoHvg5zj/htLMAvFY06KfkQi
+a9CGPQmIdEYhieoio2Dx1DxB5r0KHXoOUe+MM3LF8hjJC6UJ4ZhZAqENew+6NVY
yPhLCVnqO7vPZldaQskG0SYZWxFl1YqdTQYY6uxE7E0YSp1UrdoGyW2mfhaF/hqy
UYp+It6lrIiuTwgT1y08ui5DqeirOcsL6tP+/zs+C/oI4m5FD0nMLIImY0k9eFJZ
pEYcmoZr2+3iEJYMV2ilSdNrrAtljljCztEMtQo=
-----END CERTIFICATE-----
EOF
)

docker rm -fv herokuish 2>/dev/null || true

time docker run --name herokuish -ti \
  -e "BUILDPACK_URL=https://github.com/1024pix/subdir-buildpack" \
  -e IMPORT_PATH=/not/a/directory \
  -v herokuish-cache-${APPLICATION_NAME}:/tmp/cache \
  -v $PWD/tmp/pix.tar:/tmp/pix.tar:ro \
  -v $PWD/tmp/herokuenv:/tmp/env \
  gliderlabs/herokuish:v0.4.4 \
  sh -c 'tar -C /app -xf /tmp/pix.tar && /bin/herokuish test'
