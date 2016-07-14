# eslint-plugin-banhammer
ESLint rule to prevent specific functions from being called

## Installation:
```npm install --save-dev eslint-plugin-banhammer```

## Usage
Add the `banhammer` module to the `plugins` directive of your config
  
Add the following rule to ban the usage of window.getSelection and Object.keys in the codebase:
```
"banhammer/no-restricted-functions": [
    "error",
    "window.getSelection",
    "Object.keys",
],
```
