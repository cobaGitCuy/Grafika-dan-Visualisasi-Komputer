var $element = document.getElementById("myChart"),
    $btn = document.getElementById("showYear");
    
//membuat konteks untuk menggambar pada canvas
var ctx = $element.getContext("2d");

//deklarasi variabel
var myChart;
var data = {},
  prosesData = {},
  penutupan = {};
var labels = [];

//menggunakan ajax untuk query json
var jsonData = $.ajax({
  url: 'https://json.extendsclass.com/bin/2d9abb33c8ef',
  dataType: 'json',
}).done(function(results) {
  //menentukan value yang akan ditampilkan
  prosesData = processData(results);
  data = {
    labels: prosesData.labels,
    datasets: [{
      label: "Microsoft Stock",
      borderColor: '#FFF',
      backgroundColor: '#DC143C',
      data: prosesData.data
    }]
  };

  myChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      "scales": {
        "yAxes": [{
          "ticks": {
            "beginAtZero": true
          }
        }]
      }
    }
  });
});

var processData = function(jsonData) {

  var jsonVal = jsonData["Time Series (Daily)"]

  var dataSet = [];

  var tanggal;
  var lokal = "en-us";
  var bulan = Object.keys(jsonVal).map(function(item) {
    tanggal = new Date(item);

    return tanggal.toLocaleDateString(lokal, {
      month: "long"
    });
  }).filter(function(elem, index, self) {
    return index == self.indexOf(elem);
  });

  function urutBulan(arr) {
    var bln = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    arr.sort(function(a, b) {
      return bln.indexOf(a) - bln.indexOf(b);
    });
    return arr;
  };

  labels = urutBulan(bulan);

  for (var i = 0, total = labels.length; i < total; i++) {
    penutupan[labels[i]] = {
      close: 0,
      allValue: [],
      allKey: []
    }
  }

  var bulanSkrg;
  Object.keys(jsonVal).filter(function(item) {
    tanggal = new Date(item + " 00:00:00");
    bulanSkrg = tanggal.toLocaleDateString(lokal, {
      month: "long"
    });

    if (penutupan[bulanSkrg]["close"] < jsonVal[item]["4. close"]) {
      penutupan[bulanSkrg]["close"] = jsonVal[item]["4. close"];
    }

    penutupan[bulanSkrg]["allKey"].push(item);
    penutupan[bulanSkrg]["allValue"].push(parseFloat(jsonVal[item]["4. close"]));

    return 0;
  });

  for (var i in penutupan) {
    dataSet.push(penutupan[i].close);
  }
  ///debugger;
  
  return {
    labels: labels,
    data: dataSet
  }
};

$element.onclick = function(event) {
  var activePoints = myChart.getElementsAtEvent(event);

  if (activePoints.length > 0) {
    //ambil bagian pada index
    var clickedElementindex = activePoints[0]["_index"];

    //ambil label spesifik pada index 
    var label = myChart.data.labels[clickedElementindex];

    //ambil nilai index      
    var value = myChart.data.datasets[0].data[clickedElementindex];

    
    /* update data grafik */
    if(labels.indexOf(label) != -1) {
      myChart.data.labels = penutupan[label].allKey.reverse();
      myChart.data.datasets[0].data = penutupan[label].allValue.reverse();
      myChart.update();  
      $btn.classList.remove("hide");
    }
    
  }
};
$btn.onclick = function(event) {
  myChart.data.labels = prosesData.labels;
  myChart.data.datasets[0].data = prosesData.data;
  myChart.update();  
  $btn.classList.add("hide");
}