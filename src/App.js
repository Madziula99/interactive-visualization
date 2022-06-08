import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import SongsChart from './components/SongsChart';
import BrushChart from './components/BrushChart';

import { Container, Row, Col, Button, Form, Card, Navbar } from 'react-bootstrap';

function randomNumberInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function App() {
  const CLIENT_ID = '9429b93612cc4b26a9de54368c717993'
  const REDIRECT_URI = 'https://main--enchanting-panda-9de580.netlify.app'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'

  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [songs, setSongs] = useState([])

  const [num, setNum] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNum(randomNumberInRange(20, 50));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    if(!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token)
  }, []);

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  const searchSongs = async (e) => {
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "track",
        limit: num
      }
    })

    setSongs(data.tracks.items)
    return false
  }

  const renderSongs = () => {
    return songs.map(song => (
      <Card tag='a' className='card-item w-50 mb-2 d-flex justify-content-center' variant='top' key={song.id}>
        {song.album.images.length > 0 ? <Card.Img className='' src={song.album.images[0].url} /> : <h2>No image</h2>}
        <Card.Title className='fs-6 mt-1'>{song.name}</Card.Title>
      </Card>
    ))
  }

  return (
    <React.Fragment>
      <Container>
        <Row>
          <Col>
            <h1 className='center-header mt-3'>Welcome!</h1>
            {!token ?
              <Navbar expand="lg" variant="dark" className='center-header'>
                <Container>
                  <Navbar.Brand className='m-auto' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
                    Sign in to spotify
                  </Navbar.Brand>
                </Container>
              </Navbar>
              : <Navbar expand="lg" variant="dark" className='center-header'>
                  <Container>
                    <Navbar.Brand className='m-auto nav-cursor' onClick={logout}>
                      Sign out
                    </Navbar.Brand>
                  </Container>
                </Navbar>
            }

            {token ?
              <Form className='center-header' onSubmit={searchSongs}>
                <Form.Group className='mb-3 d-grid gap-2'>
                  <Form.Control className='mb-2' placeholder='phrase' type="text" onChange={e => setSearchKey(e.target.value)}></Form.Control>
                  <Button variant='outline-success' type="submit">Search</Button>
                </Form.Group>
              </Form>
              : <h2 className='center-header'>Sign in to spotify to continue</h2>
            }
          </Col>
        </Row>
        <Row>
          <Col xs='6' md='4'>
            {renderSongs()}
          </Col>

          <Col xs='8' md='8' className='p-5'>
            {/* {assignData()} */}

            {songs.length > 0 ?
              <SongsChart songs={songs}>
                {(selection) => <BrushChart songs={songs} selection={selection} />}
              </SongsChart>
            : <></>
            }
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
}

export default App;
