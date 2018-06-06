// const type = 'dev'
const type = 'pro'
var config = {
  dev: {
    appid: 'wx719af42c3a22ad73',
    appSecret: '4ad928af54d91683cfd16b0f4d1c10a4',
    api: 'https://records.zhizukj.com/ydb/entry/',
    version: 'v1.0.00',
    imgPath: '/static/image/',
    key: '3URBZ-FX6KD-H654D-H25M2-YVGJO-UAFXD'
  },
  pro: {
    appid: 'wx719af42c3a22ad73',
    appSecret: '4ad928af54d91683cfd16b0f4d1c10a4',
    api: 'https://records.zhizukj.com/ydb/entry/',
    version: 'v1.0.00',
    imgPath: '/static/image/',
    key: 'G5DBZ-NH5KD-D3A4F-HK246-D7SJZ-H3BDB'
  }
}

module.exports = config[type]