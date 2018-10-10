import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import Search from './components/Search.jsx';
import List from './components/List.jsx';
import Purchase from './components/Purchase.jsx'
// const { filterAsync } = require('node-filter-async');

const filter = require('promise-filter')


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      city: null,
      price: null,
      leave: null,
      returning: null,
      origin: null,
      purchaseToggle: false

    }

  }
  
  //will save every starred flight (these are faves) 
  // and the rip w/componentDidmount...maybe
  componentDidMount() {
    $.ajax({
      url: '/liked', 
      success: (data) => {
        this.setState({
          items: data
        })
        console.log('do I have a body?', data)
      },
      error: (err) => {
        console.log('err', err);
      }
    });
  }
  //pass through as props as onSearch
  //it's the clickMe function!!!


  clickMe(city, price, leave, returning, origin) {
    console.log('this is the ORIGIN', origin)
    $.ajax({
      method: 'POST', 
      url: '/liked',
      data: { origin: origin, city: city, price: price, leave: leave, returning: returning },
      dataType: 'json'
    }).done((data) => {
      let options = {origin: data.origin, city: data.city, price: data.price, leave: data.leave, returning: data.returning}
      // console.log('this is the data from fetch', data.city, data.city, data.price, data.leave, data.returning )
      this.setState({city: data.city, price: data.price, leave: data.leave, returning: data.returning, origin: data.origin, purchaseToggle: true})
      fetch('/reroute', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(options)
      })

    })

  }
  search(city, price, leaveDate, returnDate) {
    
    $.ajax({
      method: 'POST',
      url: '/flights',
      data: {
        city: city,
        price: price,
        leaveDate: leaveDate,
        returnDate: returnDate
      },
      dataType: 'json',
    }).done((data) => {
      console.log('THIS IS THE DATA', data)
      Promise.resolve(data.Quotes)
        .then(filter((quote) => quote.MinPrice <= price))
        .then((prices) => {
          let output = []
          prices.forEach((price) => {
            data.Places.forEach((place) => {
              if (price.OutboundLeg.DestinationId === place.PlaceId) {
                output.push([place.CityName, price.MinPrice, leaveDate, returnDate, city])
              }
            })
          })
          return output;
        })
        .then((results) => {
          // console.log('RESULTS', results)
          this.setState({items: results})
          console.log(this.state)
        })
      })
    }
    render() {
      return (<div>
        <div className="header">
        <h1 className="header-chumpy">justGo</h1>
        <img className="my-svg-alternate" src="flight.svg" alt="logo"/>
        </div>
        {this.state.purchaseToggle ? 
        
        <Purchase city={this.state.city} price={this.state.price} leave={this.state.leave} return={this.state.returning} origin={this.state.orgin}/>
        : null}
        <Search onSearch={this.search.bind(this)} />
        <List items={this.state.items} onClick={this.clickMe.bind(this)}/>
        {/* <VideoList videos={this.state.videos} onClick={this.handleClick.bind(this)}/> */}
      </div>)
    }
  }
  
  // city: null,
  // price: null,
  // leave: null,
  // returning: null,
  // origin: null
  
            
  ReactDOM.render(<App />, document.getElementById('app'));
          




