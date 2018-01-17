'esversion 6'

import React, { Component } from 'react';
import './App.css';
import moment from 'moment';

function AlertItem(props) {
  let itemArray = [], tailArray = [];
  let itemDate = '', description = 'RSS feed content fail', affecting = '', alertType = 'alert';

  itemArray = props.itemContent.split(' - ');
  if (itemArray.length === 2) {
    itemDate = itemArray[0];
    tailArray = itemArray[1].split('- Affecting:');
    
    if (tailArray.length === 2) {
      description = tailArray[0].trim();
      affecting = tailArray[1].trim();

      if (affecting === 'System Wide Alert') {
        alertType += ' swa';
      } else {
        alertType += ' line';              
      }
    }
  }
  return (

      <li key={ props.key } className={ alertType }>
        <div className={'header'}>{ affecting } - { itemDate }</div>
        <div className={'description'}>{ description }</div>
      </li>

  );
}
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
        alerts[count] = moment(alert.date).fromNow() + ' - ' + alert.content;
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

              return (
                <AlertItem
                  key={ i }
                  itemContent={ a } />
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
