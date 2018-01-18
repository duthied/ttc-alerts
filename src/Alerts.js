'esversion 6'

import React, { Component } from 'react';
import { CSSTransitionGroup } from 'react-transition-group'
import './App.css';
import moment from 'moment';

function AlertHeader(props) {
  return (
    <div className='alert-header'>

      <button className='btn' id='update' onClick={props.handler}>
          update
        </button>

      { props.alertCount } Alerts 
      <div className='updatedAt'>
        { props.updatedAt }
      </div>

    </div>
  )
}

function ItemHeader(props) {
  var headerClass = 'header';
  var lines = ['501', '504', '514', 'Yonge-University-Spadina', 'Bloor-Danforth'];

  for (let line of lines) {
    if (props.affecting.indexOf(line) !== -1) {
      headerClass += '-red';
      break;
    }
  }

  return (
    <div className={ headerClass }>{ props.affecting } - { props.itemDate }</div>
  )
}

function AlertItem(props) {
  let itemArray = [], tailArray = [];
  let itemDate = '', description = 'RSS feed content fail', affecting = '', alertType = 'alert';

  itemArray = props.itemContent.split(' - ');
  if (itemArray.length === 2) {
    itemDate = formatItemDate(itemArray[0]);
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
      <li className={ alertType }>

        <ItemHeader
          affecting={ affecting }
          itemDate={ itemDate } />

        <div className={'description'}>{ description }</div>
      </li>
  );
}

function formatItemDate(value) {
  return moment(value).fromNow();
}

class Alerts extends Component {
  constructor () {
    super()
    this.state = {
      rssFeed: 'https://us-central1-rssproxy-192114.cloudfunctions.net/rssGET2',
      fetchError: null,
      alerts: null,
      lastFetched: null,
      intervalId: null,
      timeSinceFetched: null
    }

    // bind addtional functions
    this.timer = this.timer.bind(this);
    this.update = this.update.bind(this);
    this.fetchRSS = this.fetchRSS.bind(this);
  }
  
  componentDidMount() {
    var intervalId = setInterval(this.timer, 60000); // 1 minute
    // store intervalId in the state so it can be accessed later:
    this.setState({intervalId: intervalId});
    var fetchError = this.fetchRSS(this.state.rssFeed);
    this.setState({fetchError: fetchError});
  }

  fetchRSS(url) {
    var parser = require('rss-parser');
    let self = this;

    parser.parseURL(this.state.rssFeed, function(err, parsed) {
      if (err) {
        return err;
      }

      if (parsed.feed.entries.count <= 0) {
        return 'no data';
      }

      let alerts = []; 
      let count = 0;
      parsed.feed.entries.forEach( function(alert) { 
        alerts[count] = alert.date + ' - ' + alert.content;
        count++;
      });

      self.setState({alerts: alerts});
      self.setState({lastFetched: Date.now()});
      self.setState({timeSinceFetched: moment(Date.now()).fromNow()});

      return;
    });
  }

  componentWillUnmount() {
      // use intervalId from the state to clear the interval
      clearInterval(this.state.intervalId);
  }

  update() {
    this.setState({alerts: null});
    var fetchError = this.fetchRSS(this.state.rssFeed);
    this.setState({fetchError: fetchError});
  }

  render() {
    if (this.state.fetchError) {
      return(
        <div>
          Error fetching data: { this.state.fetchError }
        </div>
      )
    }

    if (this.state.alerts) {
      return(
        <CSSTransitionGroup
          transitionName="alert"
          transitionAppear={true}
          transitionAppearTimeout={500}
          transitionEnter={false}
          transitionLeave={false}>

          <div id='alerts'>
            
            <AlertHeader
              alertCount={ this.state.alerts.length }
              updatedAt={ this.state.timeSinceFetched }
              handler={ this.update } />

            <ul>
              {this.state.alerts.map(function(a, i){

                return (
                  <AlertItem
                    key={ i }
                    itemContent={ a } />
                )
                
              })}
            </ul>
            <div className='alert-footer'>
              <a href="http://www.ttc.ca/Service_Advisories/all_service_alerts.jsp">TTC Service Alerts Site</a>
            </div>
          </div>
        </CSSTransitionGroup>
      )
    }

    return (
      <div id='loading'>
        <img src="ripple.gif" alt='loading gif'/>
      </div>
    )
  }

  timer() {
    let timeSinceFetched = moment(this.state.lastFetched).fromNow();
    this.setState({ timeSinceFetched: timeSinceFetched });
  }
}

export default Alerts;
