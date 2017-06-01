    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    // start
    var assumption = 0.3;
    var cost = 202500;  
    function coordination_data() {
      return 'https://mapc-admin.carto.com/api/v2/sql?q=select%20to_date(split_part(year%2C%27-%27%2C1)%2C%20%27YYYY%27)%20AS%20year%2C%20SUM(annual_cost)%2F5%20AS%20%22Status%20Quo%22%2C%20SUM((annual_cost%2F5)%20-%20(' + cost + '%3A%3Aint%20*%20miles%20*%20' + assumption + '%20%2F%205))%20AS%20%22With%20Coordination%22%2C%20SUM(153050%3A%3Aint%20*%20miles%20*%20' + assumption + ')%20AS%20savings_5yr%20FROM%20%22mapc-admin%22.gas_leaks_coordination_raw_data%20GROUP%20BY%20year%20ORDER%20BY%20year&format=csv'
    }

    var chart = c3.generate({
        bindto: '#coordination',
        data: {
          x: 'year',
          type: 'spline',
          url: coordination_data(),
          hide: ['savings_5yr']
        },
        axis: {
          x: {
            label: {
              text: "Year",
              position: "outer-center"
            },
            type: 'timeseries',
            tick: {
              format: '%Y',
              count: 30
            }
          },
          y: {
            label: {
              text: "Annual Cost",
              position: "outer-middle"
            },
            tick: {
              format: function(d) {
                return "$" + d3.format('.2s')(d);
              }
            }
          }
        },
        grid: {
          x: {
            show: true 
          },
          y: {
            show: true
          }
        },
        legend: {
          hide: true
        },
        tooltip: {
          format: {
            value: function (value, ratio, id, index) { return "$" + d3.format('.2s')(value); }
          }
        },
        color: {
          pattern: ['#e2543d', '#189a8c']
        },
        onrendered: function() {
          var that = this;
          load_total();
          
          var annotations = [
            {
              "xVal": 1798761600000,
              "yVal": 289100000,
              "path": "M152,22C171,30,184,45,178,82",
              "text": "Cost with Status Quo",
              "textOffset": [
                73,
                17
              ]
            },
            {
              "xVal": 1798761600000,
              "yVal": 289100000,
              "path": "M-6,180C17,204,75,227,109,198",
              "text": "Cost With Coordination",
              "textOffset": [
                -122,
                173
              ]
            }
          ];
          
          var swoopy = d3.swoopyDrag()
                        .x(function(d){ return that.x(d.xVal) })
                        .y(function(d){ return that.y(d.yVal) })
                        .annotations(annotations);

          // hack area spline
          // animate line

          if (!this.renderedOnce) {
            var path = d3.selectAll('.c3-line'); 
            var totalLength = path.node().getTotalLength(); 
            path.attr("stroke-dasharray", totalLength + " " + totalLength) 
                    .attr("stroke-dashoffset", totalLength)
                    .transition() 
                    .duration(2000) 
                    .ease("linear") 
                    .attr("stroke-dashoffset", 0);

            this.svg.append('g')
                    .attr('class', 'swoopy')
                    .call(swoopy)
                    .selectAll('path').attr('marker-end', 'url(#arrow)');  
          } else {
            var path = d3.selectAll('.c3-line'); 
            var totalLength = path.node().getTotalLength(); 
            path.attr("stroke-dasharray", totalLength + " " + totalLength) 
                    .attr("stroke-dashoffset", totalLength)
                    .attr("stroke-dashoffset", 0);

            this.svg.select('g.swoopy').selectAll('*').remove();
            this.svg.select('g.swoopy').call(swoopy)
                    .selectAll('path').attr('marker-end', 'url(#arrow)');  ; 
          }
          this.renderedOnce = true;

        }
    });

    function load_total() {
      var that = this;
      var savings = chart.data().filter(function(el) {
        return el.id == "savings_5yr";
      })[0];

      var total = savings.values.map(function(el) {
        return el.value;
      }).reduce(function(a, b) { return a + b; }, 0);

      d3.select('#total-saved')
        .transition()
        .duration(1800)
        .tween("text", function() {
          var start;
          if (!that.oldValue) {
            start = 0;
            that.oldValue = total;
          } else {
            start = that.oldValue;
            that.oldValue = total;
          }

          var i = d3.interpolate(start, total);  

          return function(t) {
            d3.select(this).text("$" + d3.format(',.3r')(i(t)));
          };
        });
    }

    $('#assumptions input').on('change', function() {
      var val = $('input[name="radio"]:checked', '#assumptions').val();
      assumption = val;

      chart.load({
        url: coordination_data()
      });

    })

    var emitter_data = "https://mapc-admin.carto.com/api/v2/sql?q=SELECT%20extentareanum,%20count(extentareanum)%20FROM%20%22mapc-admin%22.final_survey_carto%20GROUP%20BY%20extentareanum%20ORDER%20BY%20extentareanum&format=csv"

    var emitters = c3.generate({
        bindto: '#superemitters',
        data: {
          x: 'extentareanum',
          y: 'count',
          url: emitter_data,
          type: "scatter",
          color: function (color, d) { 
            if (d.x >= 1000) {
              return "#e2543d"
            } else {
              return color;  
            }
            
          }
        },
        legend: {
          hide: true
        },
        point: {
          r: function(d) {
            return d3.scale.sqrt()
              .domain([0, 5000])
              .range([0, 35])
                (d.x);
          }
        },
        axis: {
          x: {
            label: {
              text: "Leak Extent (in Square Feet)",
              position: "outer-center"
            },
            padding: {
              left: 0,
              right: 750,
            },
            tick: {
              fit: false,
              format: function(d) {
                return d3.format(',')(d);
              }
            },

          },
          y: {
            label: {
              text: "Count of Leaks",
              position: "outer-middle"
            }
          }
        },
        regions: [
          { axis: 'x', start: 1000, class: 'superemitters', opacity: 0.2 }
        ],
        grid: {
          x: {
            lines: [
                {value: 1000, text: 'Super-Emitters', position: 'end', "class": 'label-super-emitters'}
            ] 
          }
        }
    });
