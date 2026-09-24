const {lua,lauxlib,lualib,to_luastring,to_jsstring}=require('fengari');
self.onmessage=e=>{
 const L=lauxlib.luaL_newstate();let size=0;
 const emit=text=>{size+=text.length;if(size>64000)throw Error('Salida máxima: 64 KB');self.postMessage({type:'output',text});};
 try{
 lualib.luaL_openlibs(L);
 lua.lua_pushjsfunction(L,state=>{const values=[];for(let i=1;i<=lua.lua_gettop(state);i++){const text=lauxlib.luaL_tolstring(state,i);values.push(to_jsstring(text));lua.lua_pop(state,1);}emit(values.join('\t'));return 0;});lua.lua_setglobal(L,to_luastring('print'));
 const lines=e.data.stdin.split('\n');let cursor=0;
 lua.lua_newtable(L);lua.lua_pushjsfunction(L,state=>{if(cursor>=lines.length)lua.lua_pushnil(state);else lua.lua_pushstring(state,to_luastring(lines[cursor++]));return 1;});lua.lua_setfield(L,-2,to_luastring('read'));lua.lua_setglobal(L,to_luastring('io'));
 let status=lauxlib.luaL_loadstring(L,to_luastring(e.data.code));if(status===lua.LUA_OK)status=lua.lua_pcall(L,0,lua.LUA_MULTRET,0);
 if(status!==lua.LUA_OK)throw Error(to_jsstring(lua.lua_tostring(L,-1)));self.postMessage({type:'done'});
 }catch(error){self.postMessage({type:'error',text:String(error)});}finally{lua.lua_close(L);}
};
self.postMessage({type:'ready'});
