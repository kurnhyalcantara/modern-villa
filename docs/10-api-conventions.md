# API Conventions

## API Rules

- Use RESTful patterns
- Consistent response format

## Success Response

\`\`\`json
{
"success": true,
"data": {}
}
\`\`\`

## Error Response

\`\`\`json
{
"success": false,
"message": "Validation error"
}
\`\`\`

## Validation

- Validate all request bodies
- Validate query params

## Error Handling

- Centralized error handling
- Consistent HTTP status codes
