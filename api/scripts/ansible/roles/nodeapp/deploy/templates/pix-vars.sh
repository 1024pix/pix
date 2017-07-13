#!/bin/bash

{% for env in pix_environment %}
export {{ env }}={{ pix_environment[env]}}
{% endfor %}