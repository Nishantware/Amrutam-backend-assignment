require('dotenv').config();
require('./instrumentation');
if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<32){console.error('JWT_SECRET must be set and at least 32 characters');process.exit(1);}
const app=require('./app');const {pool}=require('./config/db');const port=Number(process.env.PORT||3000);const server=app.listen(port,()=>console.log(`Amrutam API listening on ${port}`));
async function shutdown(signal){console.log(`${signal} received; shutting down`);server.close(async()=>{await pool.end();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}
process.on('SIGTERM',()=>shutdown('SIGTERM'));process.on('SIGINT',()=>shutdown('SIGINT'));
