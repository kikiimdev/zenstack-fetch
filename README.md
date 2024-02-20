# ZenStack Fetch Plugin

ZenStack Fetch Plugin is a standard plugin of [ZenStack](https://github.com/zenstackhq/zenstack) to generate fetch from the ZModel schema with ofetch.

## Example

TBD

## Setup

```bash
npm i -D @kiki.im.dev/zenstack-fetch
```

add the plugin in your ZModel schema file

```ts
plugin fetch {
    provider = 'zenstack-fetch'
}
```

run zenstack generate

```bash
npx zenstack generate
```

you will see the `schema.md` generated in the same folder of your ZModel schema file.

## Options

TBD

<!-- | Name     | Type    | Description                                       | Required | Default   |
| -------- | ------- | ------------------------------------------------- | -------- | --------- |
| output   | String  | Output file path (relative to the path of ZModel) | No       | schema.md |
| disabled | Boolean | Whether to run this plugin                        | No       | false     | -->

example:

```ts
plugin zenstackmd {
    provider = 'zenstack-fetch'
    output = 'docs/schema.md'
    disabled = true
}
```

<!-- You can also disable it using env variable

```bash
DISABLE_ZENSTACK_MD=true
``` -->

## Local Development

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

After build, the plugin will be generated in `dist` folder. Then you can use it in your existing ZModel schema by setting the `provider` this `dist` folder

```ts
plugin zenstackmd {
    provider = '.../zenstack-fetch/dist'
}
```

`provider` could either by the absolute path or relative path to the running `zenstack` module.

### Run Sample

simply run `npm run dev` to see a more complicated result [schema.md](./schema.md) generated from [schema.zmodel](./schema.zmodel)
