'use strict';

const adaptername = "rpitest"
console.log("Starting Adapter: " + adaptername);

const utils = require('@iobroker/adapter-core');
var adapter  = utils.Adapter (adaptername);

var zerorpc = require("zerorpc");
var client = new zerorpc.Client();
//client.connect("tcp://192.168.1.23:4242");


var LOG_ALL = false;						//Flag to activate full logging

//RPC CONNECTION values
var IPADR  = "0.0.0.0";						//DMXface IP address
var PORT = 0;								//DMXface port of TCP server ACIVE SEND socket (Configured @ DMXface Setup)
var TIMING = 1000;							//Request timing for addtional added ports and analog input
var TEST = 0;


//*************************************  ADAPTER STARTS with ioBroker *******************************************
adapter.on ('ready',function (){
   
   IPADR = adapter.config.ipaddress;
   PORT = adapter.config.port;
   TIMING = adapter.config.requesttiming;
   
   if (TIMING <100){TIMING = 100;}
   if (TIMING > 3600000) {TIMING = 3600000;}

   client.connect("tcp://" + IPADR + ":" + PORT);


   TEST = setInterval(CYCLIC, TIMING);


   adapter.setObjectNotExists ('KLVL',{
      type:'state',
      common:{name:'Temperature1',type:'number',role:'common',read:true,write:true},
      native:{}
   });
   adapter.setObjectNotExists ('KLRL',{
      type:'state',
      common:{name:'Temperature2',type:'number',role:'common',read:true,write:true},
      native:{}
   });
   adapter.setObjectNotExists ('WTVL',{
      type:'state',
      common:{name:'Temperature3',type:'number',role:'common',read:true,write:true},
      native:{}
   });
   adapter.setObjectNotExists ('WTRL',{
      type:'state',
      common:{name:'Temperature4',type:'number',role:'common',read:true,write:true},
      native:{}
   });
   adapter.setObjectNotExists ('Out1',{
      type:'state',
      common:{name:'Output1',type:'number',role:'common',read:true,write:true},
      native:{}
   });
   
/*
   adapter.setObjectNotExists ('TEST_String',{
      type:'state',
      common:{name:'INPUT2',type:'string',role:'common',read:true,write:true},
      native:{}
   });

   adapter.setObjectNotExists ('TEST_Bool',{
      type:'state',
      common:{name:'INPUT3',type:'boolean',role:'common',read:true,write:true},
      native:{}
   });
*/

   adapter.subscribeStates('*');


});

adapter.on ('stateChange',function (id,obj){

   if (obj.from.search (adaptername) != -1) {return;}    // do not process self generated state changes (by dmxface instance) 

   var Status1 = 0;

   adapter.getState('Out1' , function (err, state) {	//get current value
   if (state !=null) {							//EXIT if state is not initialized yet
      if (state.val !=null) {					//Exit if value not initialized
         switch (state.val) {
            case 1:
               adapter.setState('TEST_String',"AUTO",true);
               client.invoke("Out1Auto")
               break;
            case 2:
               adapter.setState('TEST_String',"OFF",true);
               client.invoke("Out1Off")
               break;
            case 3:
               adapter.setState('TEST_String',"ON",true);
               client.invoke("Out1On")
               break;
         }
      }
   }

   });


/*
   adapter.getState('TEST_Bool', function (err, state) {
      console.log (state);
      adapter.log.info(
            'State ' + adapter.namespace + '.TEST_Num -' + 
            '  Value: '        + state.val + 
            ', ack: '          + state.ack + 
            ', time stamp: '   + state.ts  + 
            ', last changed: ' + state.lc
      ); 
  
  }); 
*/

});

   


function CYCLIC () {

   client.invoke("KLVL", function(error, res, more) 
	{
      adapter.setState('KLVL',res,true);
   });
   client.invoke("KLRL", function(error, res, more) 
	{
      adapter.setState('KLRL',res,true);
   });
   client.invoke("WTVL", function(error, res, more) 
	{
      adapter.setState('WTVL',res,true);
   });
   client.invoke("WTRL", function(error, res, more) 
	{
      adapter.setState('WTRL',res,true);
   });


}

function CONNECT_CLIENT () {
	IS_ONLINE = false;
	adapter.log.info("Connecting DMXface controller " + IPADR + " "+ PORT);
	client.connect (PORT,IPADR);
}



