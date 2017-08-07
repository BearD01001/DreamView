import React, { Component } from 'react'
import ImgUtil from '../model/img-util'

class Landscape extends Component {
  state = {
    imgLoaded: false,
    imgData: void(0)
  }
  async componentWillMount() {
    let imgData = await ImgUtil.get()

    this.refs.img.src = imgData
    this.setState({ imgData })
  }
  imgLoaded () {
    setTimeout(() => {
      this.setState({ imgLoaded: true })
    }, 500)
  }
  render() {
    let style = {
      backgroundImage: this.state.imgData ? `url(${ this.state.imgData })` : 'none',
      position: 'absolute',
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      opacity: this.state.imgLoaded ? 1 : 0,
      zIndex: -1,
      transition: 'opacity .5s'
    }
    
    return (
      <div style={ style }>
        <img
          ref='img'
          onLoad={ this.imgLoaded.bind(this) }
          style={{ display: 'none' }}
          alt='Dream view'
        />
      </div>
    )
  }
}

export default Landscape