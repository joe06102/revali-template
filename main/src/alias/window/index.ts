import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><div>ssr</div>', {
  url: 'https://jsouee.fun',
})

export default dom.window
