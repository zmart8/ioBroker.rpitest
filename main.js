'use strict';

const adaptername = "rpitest"
console.log("Starting Adapter: " + adaptername);

const utils = require('@iobroker/adapter-core');
var adapter  = utils.Adapter (adaptername);

var zerorpc = require("zerorpc");
var client = new zerorpc.Client();
//client.connect("tcp://192.168.1.23:4242");
//client.invoke("KLVL", function(error, res, more) 
//{
//  console.log(res);
//});



var LOG_ALL = true;						//Flag to activate full logging

//RPC CONNECTION values
var IPADR  = "0.0.0.0";						//DMXface IP address
var PORT = 0;								//DMXface port of TCP server ACIVE SEND socket (Configured @ DMXface Setup)
var TIMING = 1000;							//Request timing for addtional added ports and analog input
//var TEST = 0;


//*************************************  ADAPTER STARTS with ioBroker *******************************************
adapter.on ('ready',function (){
   
   console.log("Hansi");
   
   IPADR = adapter.config.ipaddress;
   PORT = adapter.config.port;
   TIMING = adapter.config.requesttiming;
   
   if (TIMING <100){TIMING = 100;}
   if (TIMING > 3600000) {TIMING = 3600000;}

   client.connect("tcp://" + IPADR + ":" + PORT);
  // client.connect("tcp://192.168.1.23:4242");


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
   adapter.setObjectNotExists ('Setpoint_On',{
      type:'state',
      common:{name:'Setpoint_On',type:'number',role:'common',read:true,write:true},
      native:{}
   });
   adapter.setObjectNotExists ('Setpoint_Off',{
      type:'state',
      common:{name:'Setpoint_Off',type:'number',role:'common',read:true,write:true},
      native:{}
   });
   adapter.setObjectNotExists ('GetStatusOut1',{
      type:'state',
      common:{name:'GetStatusOut1',type:'boolean',role:'common',read:true,write:true},
      native:{}
   });


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

   adapter.getState('Setpoint_On' , function (err, state) {	//get current value
   if (state !=null) {							//EXIT if state is not initialized yet
      if (state.val !=null) {					//Exit if value not initialized
         client.invoke("SetSPOn", state.val)
         }
      }      
   });
   
   adapter.getState('Setpoint_Off' , function (err, state) {	//get current value
      if (state !=null) {							//EXIT if state is not initialized yet
         if (state.val !=null) {					//Exit if value not initialized
            client.invoke("SetSPOff", state.val)
            }
         }      
      });
      
});

   


function CYCLIC () {

   client.invoke("KLVL", function(error, res, more) 
	{
      adapter.setState('KLVL',res,true);
      console.log(res);
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
   client.invoke("GetStatusOut1", function(error, res, more) 
	{
      if (res == "AutoOff") {res = false}
      if (res == "AutoOn") {res = true}
      if (res == "ManualOff") {res = false}
      if (res == "ManualOn") {res = true}
      adapter.setState('GetStatusOut1',res,true);
   });


}

