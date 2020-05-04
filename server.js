const path = require('path');
const Koa = require('koa');
const logger = require('koa-logger')
const Router = require('koa-router');
const render = require('koa-ejs');
const static = require('koa-static');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');

const ethutil = require('ethereumjs-util');

const app = new Koa();
app.keys = ['app_keys_abc']
app.use(session(app));

app.use(logger())
app.use(bodyParser());

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout/template',
  viewExt: 'ejs',
  cache: false,
  debug: false
});

app.use(static(__dirname + '/public'));

const router = new Router();

router.get('/', async (ctx) => {
  await ctx.render('index', {address: ctx.session.address});
});

router.post('/sign', async(ctx) => {
  const address = ctx.request.body.address.toLowerCase();
  console.log(address);
  let message = ctx.request.body.message;
  let sig = ctx.request.body.sig;

  if (message.startsWith('0x')) {
    message = ethutil.toBuffer(message)
  } else {
    message = Buffer.from(message);
  }

  const msg = ethutil.hashPersonalMessage(message);
  const {v, r, s} = ethutil.fromRpcSig(sig);
  const pubKey  = ethutil.ecrecover(msg, v, r, s);
  const addrBuf = ethutil.pubToAddress(pubKey);
  const addr = ethutil.bufferToHex(addrBuf);
  console.log(addr);
  if (addr != address) {
    throw new Error('The addresses don\'t match.');
  }
  ctx.session.address = addr;
  ctx.body = { address: addr}
});

router.get('/logout', async(ctx) => {
  ctx.session.address = null;
  await ctx.redirect('/');
});

app.use(router.routes());

app.listen(3000, '0.0.0.0');
