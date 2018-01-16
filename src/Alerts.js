'esversion 6'

import React, { Component } from 'react';
import './App.css';

class Alerts extends Component {
  constructor () {
    super()
    this.state = {
      rss_feed: 'https://us-central1-rssproxy-192114.cloudfunctions.net/rssGET2',
      alerts: null
    }
  }
  
  componentDidMount() {
    var parser = require('rss-parser');
    let self = this;
    parser.parseURL(this.state.rss_feed, function(err, parsed) {
      let alerts = []; 
      let count = 0;
      parsed.feed.entries.forEach( function(alert) { 
        let alertDate = new Date(Date.parse(alert.date));
        alerts[count] = alertDate.toLocaleDateString() + ' ' + alertDate.toLocaleTimeString() + ' - ' + alert.content;
        count++;
      });

      self.setState({alerts: alerts});
    });
  }

  render() {
    
    if (this.state.alerts) {
      return(
        <div id='alerts'>
          <p style={{'fontWeight': 'bold'}}>{ this.state.alerts.length } Alerts</p>
          <ul>
            {this.state.alerts.map(function(a, i){
              let itemArray = [];
              itemArray = a.split(' - ');

              let tailArray = itemArray[1].split('- Affecting:');
              let affecting = tailArray[1].trim();
              let alertType = 'alert';
              
              if (affecting === 'System Wide Alert') {
                alertType += ' swa';
              } else {
                alertType += ' line'
;              }

              return (
                <li key={ i } className={alertType}>
                  <div className={'header'}>{ affecting } - { itemArray[0] }</div>
                  <div className={'description'}>{ tailArray[0] }</div>
                </li>
              )
              
            })}
          </ul>
          <a href="http://www.ttc.ca/Service_Advisories/all_service_alerts.jsp">TTC Service Alerts Site</a>
        </div>
      )
    }

    return <div>Loading...</div>;
  }

}

export default Alerts;
