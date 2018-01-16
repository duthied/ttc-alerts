'esversion 6'

import React, { Component } from 'react';
import './App.css';
import moment from 'moment';

class Alerts extends Component {
  constructor () {
    super()
    this.state = {
      rssFeed: 'https://us-central1-rssproxy-192114.cloudfunctions.net/rssGET2',
      alerts: null,
      lastFetched: null,
      intervalId: null,
      timeSinceFetched: null
    }

    // bind addtional functions
    this.timer = this.timer.bind(this);
  }
  
  componentDidMount() {
    var intervalId = setInterval(this.timer, 60000); // 1 minute
    // store intervalId in the state so it can be accessed later:
    this.setState({intervalId: intervalId});

    var parser = require('rss-parser');
    let self = this;
    parser.parseURL(this.state.rssFeed, function(err, parsed) {
      let alerts = []; 
      let count = 0;
      parsed.feed.entries.forEach( function(alert) { 
        let alertDate = new Date(Date.parse(alert.date));
        alerts[count] = alertDate.toLocaleDateString() + ' ' + alertDate.toLocaleTimeString() + ' - ' + alert.content;
        count++;
      });

      self.setState({alerts: alerts});
      self.setState({lastFetched: Date.now()});
      self.setState({timeSinceFetched: moment(Date.now()).fromNow()});
    });
  }

  componentWillUnmount() {
      // use intervalId from the state to clear the interval
      clearInterval(this.state.intervalId);
  }

  render() {
    
    if (this.state.alerts) {
      return(
        <div id='alerts'>
          <p style={{'fontWeight': 'bold'}}>
            { this.state.alerts.length } Alerts [{ this.state.timeSinceFetched }]
            </p>
          <ul>
            {this.state.alerts.map(function(a, i){

              // TODO: extract this to a function (decorator?)
              let itemArray = [];
              itemArray = a.split(' - ');

              let tailArray = itemArray[1].split('- Affecting:');
              let affecting = tailArray[1].trim();
              let alertType = 'alert';

              if (affecting === 'System Wide Alert') {
                alertType += ' swa';
              } else {
                alertType += ' line';              
              }

              return (
                <li key={ i } className={alertType}>
                  <div className={'header'}>{ affecting } - { moment(itemArray[0]).fromNow() }</div>
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

  timer() {
    let timeSinceFetched = moment(this.state.lastFetched).fromNow();
    this.setState({ timeSinceFetched: timeSinceFetched });
  }
}

export default Alerts;
