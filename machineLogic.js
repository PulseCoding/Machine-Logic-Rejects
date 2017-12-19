'use strict'

var LabelWatcherct = null,
    LabelWatcherresults = null,
    CntInLabelWatcher = null,
    CntOutLabelWatcher = null,
    LabelWatcheractual = 0,
    LabelWatchertime = 0,
    LabelWatchersec = 0,
    LabelWatcherflagStopped = false,
    LabelWatcherstate = 0,
    LabelWatcherspeed = 0,
    LabelWatcherspeedTemp = 0,
    LabelWatcherflagPrint = 0,
    LabelWatchersecStop = 0,
    LabelWatcherdeltaRejected = null,
    LabelWatcherONS = false,
    LabelWatchertimeStop = 60, //NOTE: Timestop
    LabelWatcherWorktime = 0.99, //NOTE: Intervalo de tiempo en minutos para actualizar el log
    LabelWatcherflagRunning = false,
    LabelWatcherRejectFlag = false,
    LabelWatcherReject,
    LabelWatcherVerify = (function(){
      try{
        LabelWatcherReject = fs.readFileSync('LabelWatcherRejected.json')
        if(LabelWatcherReject.toString().indexOf('}') > 0 && LabelWatcherReject.toString().indexOf('{\"rejected\":') != -1){
          LabelWatcherReject = JSON.parse(LabelWatcherReject)
        }else{
          throw 12121212
        }
      }catch(err){
        if(err.code == 'ENOENT' || err == 12121212){
          fs.writeFileSync('LabelWatcherRejected.json','{"rejected":0}') //NOTE: Change the object to what it usually is.
          LabelWatcherReject = {
            rejected : 0
          }
        }
      }
    })()
        //------------------------------------------LabelWatcher----------------------------------------------
              LabelWatcherct = CntOutLabelWatcher // NOTE: igualar al contador de salida
              if (!LabelWatcherONS && LabelWatcherct) {
                LabelWatcherspeedTemp = LabelWatcherct
                LabelWatchersec = Date.now()
                LabelWatcherONS = true
                LabelWatchertime = Date.now()
              }
              if(LabelWatcherct > LabelWatcheractual){
                if(LabelWatcherflagStopped){
                  LabelWatcherspeed = LabelWatcherct - LabelWatcherspeedTemp
                  LabelWatcherspeedTemp = LabelWatcherct
                  LabelWatchersec = Date.now()
                  LabelWatcherdeltaRejected = null
                  LabelWatcherRejectFlag = false
                  LabelWatchertime = Date.now()
                }
                LabelWatchersecStop = 0
                LabelWatcherstate = 1
                LabelWatcherflagStopped = false
                LabelWatcherflagRunning = true
              } else if( LabelWatcherct == LabelWatcheractual ){
                if(LabelWatchersecStop == 0){
                  LabelWatchertime = Date.now()
                  LabelWatchersecStop = Date.now()
                }
                if( ( Date.now() - ( LabelWatchertimeStop * 1000 ) ) >= LabelWatchersecStop ){
                  LabelWatcherspeed = 0
                  LabelWatcherstate = 2
                  LabelWatcherspeedTemp = LabelWatcherct
                  LabelWatcherflagStopped = true
                  LabelWatcherflagRunning = false
                  if(CntInLabelWatcher - CntOutLabelWatcher - LabelWatcherReject.rejected != 0 && ! LabelWatcherRejectFlag){
                    LabelWatcherdeltaRejected = CntInLabelWatcher - CntOutLabelWatcher - LabelWatcherReject.rejected
                    LabelWatcherReject.rejected = CntInLabelWatcher - CntOutLabelWatcher
                    fs.writeFileSync('LabelWatcherRejected.json','{"rejected": ' + LabelWatcherReject.rejected + '}')
                    LabelWatcherRejectFlag = true
                  }else{
                    LabelWatcherdeltaRejected = null
                  }
                  LabelWatcherflagPrint = 1
                }
              }
              LabelWatcheractual = LabelWatcherct
              if(Date.now() - 60000 * LabelWatcherWorktime >= LabelWatchersec && LabelWatchersecStop == 0){
                if(LabelWatcherflagRunning && LabelWatcherct){
                  LabelWatcherflagPrint = 1
                  LabelWatchersecStop = 0
                  LabelWatcherspeed = LabelWatcherct - LabelWatcherspeedTemp
                  LabelWatcherspeedTemp = LabelWatcherct
                  LabelWatchersec = Date.now()
                }
              }
              LabelWatcherresults = {
                ST: LabelWatcherstate,
                CPQI : CntInLabelWatcher,
                CPQO : CntOutLabelWatcher,
                CPQR : LabelWatcherdeltaRejected,
                SP: LabelWatcherspeed
              }
              if (LabelWatcherflagPrint == 1) {
                for (var key in LabelWatcherresults) {
                  if( LabelWatcherresults[key] != null && ! isNaN(LabelWatcherresults[key]) )
                  //NOTE: Cambiar path
                  fs.appendFileSync('C:/PULSE/L13_LOGS/mex_pcl_LabelWatcher_L13.log', 'tt=' + LabelWatchertime + ',var=' + key + ',val=' + LabelWatcherresults[key] + '\n')
                }
                LabelWatcherflagPrint = 0
                LabelWatchersecStop = 0
                LabelWatchertime = Date.now()
              }
        //------------------------------------------LabelWatcher----------------------------------------------
