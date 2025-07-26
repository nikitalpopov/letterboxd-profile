# letterboxd profile

## How to use

Fetch the badge with simple GET request to:
```
https://letterboxd-profile-github.netlify.app/api/${format}/${username}
```

| Parameter | Type | Description |
| --- | --- | --- |
| `format` | `'html'\|'svg'\|'png'` | Profile badge format |
| `username` | `string` | Valid Letterboxd account username |

## Example

[![Rian Johnson](https://letterboxd-profile-github.netlify.app/api/png/rcjohnso/)](https://letterboxd-profile-github.netlify.app/api/html/rcjohnso/)
