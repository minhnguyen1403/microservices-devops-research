{{ range services }}
{
  "services": [
    {
      "name": "{{ .Spec.Name }}",
      "port": {{ (index .Spec.Labels "consul.service.port") }},
      "tags": [{{ range (split (index .Spec.Labels "consul.tags") ",") }} "{{ . }}", {{ end }}],
      "checks": [
        {
          "http": "http://{{ .Endpoint.Spec.Address }}:{{ (index .Spec.Labels "consul.service.port") }}/health",
          "interval": "10s"
        }
      ]
    }
  ]
}
{{ end }}
