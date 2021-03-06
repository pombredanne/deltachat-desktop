const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')
const {
  Button, ButtonGroup
} = require('@blueprintjs/core')

const styled = require('styled-components').default

const MessageWrapper = require('./MessageWrapper')
const Attachment = require('./Attachment')

const Wrapper = styled.div`
  width: 70%;
  background-color: #eeefef;
  float: right;
  padding: 10px;
  margin-top: 50px;
`
const MediaGallery = styled.div`
  height: calc(100vh - 50px - 40px - 10px);
  overflow: scroll;
  padding-top: 20px;
`

const MediaGalleryItem = styled.div`
  float: left;

  .module-message__attachment-container {
    background-color: transparent;
    border-radius: 0px;
    margin: 0px !important;
  }

  .module-message__img-border-overlay {
    display: none;
  }

  .module-message__img-attachment {
    max-width: 100% !important;
  }

  .module-message__generic-attachment__text {
    div { color: black !important; }
  }


`

const GROUPS = {
  images: {
    values: [C.DC_MSG_GIF, C.DC_MSG_IMAGE]
  },
  video: {
    values: [C.DC_MSG_VIDEO]
  },
  audio: {
    values: [C.DC_MSG_AUDIO, C.DC_MSG_VOICE]
  },
  documents: {
    values: [C.DC_MSG_FILE]
  }
}

const DEFAULT_STATE = {
  id: 'images',
  msgTypes: GROUPS.images.values,
  medias: []
}

class Media extends React.Component {
  constructor (props) {
    super(props)
    this.state = DEFAULT_STATE
  }

  componentDidMount () {
    this.onSelect(this.state.id)
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.chat || (this.props.chat.id !== prevProps.chat.id)) {
      this.onSelect(this.state.id)
    }
  }

  componentWillUnmount () {
    this.setState(DEFAULT_STATE)
  }

  onSelect (id) {
    const msgTypes = GROUPS[id].values
    const medias = ipcRenderer.sendSync(
      'getChatMedia',
      msgTypes[0],
      msgTypes[1]
    )
    this.setState({ id, msgTypes, medias })
  }

  onClickMedia (message) {
    this.props.openDialog('RenderMedia', { message })
  }

  render () {
    const { medias } = this.state
    const tx = window.translate
    return <Wrapper>
      <ButtonGroup style={{ minWidth: 200 }}>
        {Object.keys(GROUPS).map((id) => {
          return <Button
            key={id}
            disabled={this.state.id === id}
            onClick={() => this.onSelect(id)}>
            {tx(id)}
          </Button>
        })}
      </ButtonGroup>
      <MediaGallery>
        {medias.map((raw) => {
          var message = MessageWrapper.convert(raw)
          var msg = message.msg
          return <MediaGalleryItem
            onClick={this.onClickMedia.bind(this, message)}
            key={message.id}>
            {Attachment.render({
              i18n: window.translate,
              direction: msg.direction,
              attachment: msg.attachment,
              collapseMetadata: true,
              conversationType: 'direct'
            })}
          </MediaGalleryItem>
        })}
      </MediaGallery>
    </Wrapper>
  }
}

module.exports = Media
