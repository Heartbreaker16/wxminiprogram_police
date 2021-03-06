const express = require('express')
const multer = require('multer')
const mysql = require('mysql')
const fs = require('fs')
const request = require('request')
const FilePath = require('path').join(__dirname, 'files')
const strFilter = str => {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
}
const mkdir = path => {
  return new Promise(resolve => {
    fs.access(path, err => {
      if (err) {
        fs.mkdir(path, err => {
          if (err) throw err
          resolve(true)
        })
      } else {
        resolve(true)
      }
    })
  })
}
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const type = file.fieldname
    if (type === 'case') {
      const path = `${FilePath}/case/${req.body.MSID}`
      mkdir(path).then(() => {
        cb(null, path)
      })
    } else if (type === 'voice') {
      cb(null, `${FilePath}/voice`)
    } else {
      cb(null, `${FilePath}/news`)
    }
  },
  filename: function(req, file, cb) {
    const type = file.fieldname
    if (type === 'case') {
      const name =
        fs.readdirSync(`${FilePath}/case/${req.body.MSID}`).length +
        '.' +
        file.originalname.split('.').pop()
      cb(null, name)
    } else if (type === 'voice') {
      cb(null, req.body.MSID + '.aac')
    } else {
      cb(null, file.originalname)
    }
  }
})
const formatTime = (myDate, format = 'date') => {
  const twoNum = num => {
    return ('0' + num).slice(-2)
  }
  switch (format) {
    case 'date':
      return `${myDate.getFullYear()}-${twoNum(myDate.getMonth() + 1)}-${twoNum(
        myDate.getDate()
      )}`
    case 'full':
      return `${myDate.getFullYear()}-${twoNum(myDate.getMonth() + 1)}-${twoNum(
        myDate.getDate()
      )} ${twoNum(myDate.getHours())}:${twoNum(myDate.getMinutes())}`
    case 'DateObj':
      return myDate
  }
}
const connectMySQL = () => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'newroot',
    password: '123456',
    database: 'police',
    charset: 'utf8mb4'
  })
  connection.connect()
  return connection
}
const upload = multer({ storage })

const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(FilePath))

app.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  fs.readFile(`${FilePath}/html/list.html`, 'utf-8', (err, data) => {
    if (err) throw err
    res.end(data)
  })
})
app.post('/register', (req, res) => {
  const connection = connectMySQL()
  const user = req.body
  let SQL = `
    SELECT *
    FROM users
    WHERE users.phone = '${user.phone}' OR users.idcard = '${user.idcard}'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if (row.length > 0) res.send('手机号或身份证号已被注册')
    else {
      SQL = `
        INSERT INTO users ( name, phone, idcard, password, openid )
        VALUES ('${strFilter(user.name)}', '${user.phone}', '${
        user.idcard
      }', '${strFilter(user.password)}', '${user.openid}')
      `
      connection.query(SQL, (err, row) => {
        if (err) throw err
        res.send('注册成功')
      })
    }
    connection.end()
  })
})
app.post('/login', (req, res) => {
  const connection = connectMySQL()
  const user = req.body
  const SQL = `
    SELECT name, USID
    FROM users
    WHERE (users.phone = '${user.account}' OR users.idcard = '${
    user.account
  }') AND users.password = '${strFilter(user.password)}'
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if (row.length === 1) res.send({ name: row[0].name, id: row[0].USID })
    else res.send('账户或密码错误')
  })
  connection.end()
})
app.post('/adminLogin', (req, res) => {
  const connection = connectMySQL()
  const SQL = 'SELECT * FROM admin_password'
  connection.query(SQL, (err, row) => {
    if (err) throw err
    if(row[0].password === req.body.password) res.send('ok')
    else res.send('deny')
    connection.end()
  })
})
app.post('/addMsg', (req, res) => {
  const connection = connectMySQL()
  const message = req.body
  const SQL = message.title
    ? `
      INSERT INTO messages(title,TPID,location,detail,USID,form_id)
      VALUES ('${strFilter(message.title)}', '${message.TPID}', '${strFilter(
        message.location
      )}', '${strFilter(message.detail)}','${message.USID}','${
        message.form_id
      }')
    `
    : `
      INSERT INTO messages(location,detail,USID,form_id)
      VALUES ('${strFilter(message.location)}', '${strFilter(
        message.detail
      )}','${message.USID}','${message.form_id}')
    `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    res.send({ MSID: row.insertId })
    connection.end()
  })
})
app.post('/addVoice', upload.single('voice'), (req, res, next) => {
  const connection = connectMySQL()
  const data = req.body
  const SQL = `
    UPDATE messages
    SET duration = ${data.duration}
    WHERE MSID = ${data.MSID}
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    res.send('ok')
    connection.end()
  })
})
app.post('/addImg', upload.single('case'), (req, res, next) => {
  res.send('ok')
})
app.get('/allTypes', (req, res) => {
  const connection = connectMySQL()
  const SQL = `
    SELECT type,TPID
    FROM types
    ORDER BY types.index
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.shift()
    res.send(row)
    connection.end()
  })
})
app.post('/handle', (req, response) => {
  const connection = connectMySQL()
  const data = req.body
  let SQL
  if (data.password === 'police') {
    SQL = `
      UPDATE messages
      SET handled = 1
      WHERE MSID = ${data.MSID}
    `
    connection.query(SQL, (err, row) => {
      if (err) throw err
      SQL = `
        SELECT title, form_id, name, type, openid
        FROM messages, types, users
        WHERE MSID = ${
          data.MSID
        } AND messages.USID = users.USID AND messages.TPID = types.TPID 
      `
      connection.query(SQL, (err, row) => {
        if (err) throw err
        request.get(
          {
            url:
              'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx4510a9a8853fa1c9&secret=d758a69f9cd9baf36a5e52c60f37ec3c'
          },
          (err, res, body) => {
            if (err) throw err
            request.post(
              {
                url: `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${JSON.parse(body).access_token}`,
                header: { 'content-type': 'application/json' },
                json: {
                  touser: row[0].openid,
                  template_id: '45VwksAgRmg5OGIfIZWyYFN0BLHoow7HnarNxKVA5PQ',
                  form_id: row[0].form_id,
                  data: {
                    keyword1: {
                      value: row[0].name
                    },
                    keyword2: {
                      value: row[0].title || '(紧急事件)'
                    },
                    keyword3: {
                      value: row[0].type
                    },
                    keyword4: {
                      value: '已受理'
                    },
                    keyword5: {
                      value: formatTime(new Date(), 'full')
                    }
                  }
                }
              },
              (err, res, body) => {
                console.log(res)
                response.send('ok')
                connection.end()
              }
            )
          }
        )
      })
    })
  }
})
app.get('/list', (req, res) => {
  const connection = connectMySQL()
  const USID = req.query.id

  const SQL = `
    SELECT title,detail,time,MSID,handled
    FROM messages
    WHERE '${USID}' = messages.USID
    ORDER BY time DESC
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.forEach(v => (v.time = formatTime(v.time)))
    res.send(row)
    connection.end()
  })
})
app.get('/listAll', (req, res) => {
  const connection = connectMySQL()

  const TPID = parseInt(req.query.TPID)
  let SQL

  switch (TPID) {
    //全部未处理
    case -1:
      SQL = ` 
      SELECT title,detail,messages.time,MSID,type
      FROM messages, types
      WHERE handled = 0 AND messages.TPID = types.TPID
      ORDER BY time DESC `
      break
    //全部已处理
    case -2:
      SQL = `
      SELECT title,detail,messages.time,MSID,type
      FROM messages, types
      WHERE handled = 1 AND messages.TPID = types.TPID
      ORDER BY time DESC `
      break
    default:
      SQL = ` 
      SELECT title,detail,messages.time,MSID,type
      FROM messages, types
      WHERE handled = 0 AND messages.TPID = ${TPID} AND messages.TPID = types.TPID
      ORDER BY time DESC `
      break
  }
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.forEach(v => (v.time = formatTime(v.time)))
    res.send(row)
    connection.end()
  })
})
app.post('/addNews', (req, res) => {
  const connection = connectMySQL()
  const news = req.body
  const SQL = `
      INSERT INTO news(title,detail,format)
      VALUES ('${strFilter(news.title)}','${strFilter(news.detail)}','${
    news.format
  }')
    `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    res.send([{ NSID: row.insertId }])
    connection.end()
  })
})
app.post('/addNewsImg', upload.single('news'), (req, res) => {
  res.send('ok')
})
app.get('/deleteNews', (req, res) => {
  const connection = connectMySQL()
  const SQL = `
    DELETE FROM news
    WHERE NSID = ${req.query.NSID}
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    fs.unlinkSync(`${FilePath}/news/${req.query.NSID}.${req.query.format}`)
    res.send('ok')
    connection.end()
  })
})
app.get('/allNews', (req, res) => {
  const connection = connectMySQL()

  const SQL = `
    SELECT *
    FROM news
    ORDER BY time DESC
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.forEach(v => {
      v.time = formatTime(v.time)
      v.img = `/news/${v.NSID}.${v.format}`
    })
    res.send(row)
    connection.end()
  })
})
app.get('/newsDetail', (req, res) => {
  const connection = connectMySQL()

  const SQL = `
    SELECT *
    FROM news
    WHERE NSID = ${req.query.NSID}
  `
  connection.query(SQL, (err, row) => {
    if (err) throw err
    row.forEach(v => {
      v.detail = v.detail.replace(/[\n]+/g, '<br>')
      v.time = formatTime(v.time, 'full')
      v.img = `/news/${v.NSID}.${v.format}`
    })
    res.send(row)
    connection.end()
  })
})
app.get('/caseDetail', (req, res) => {
  const connection = connectMySQL()
  const MSID = req.query.MSID

  const SQL = req.query.full
    ? `
    SELECT messages.*, name, idcard, phone, type
    FROM messages,users,types
    WHERE '${MSID}' = messages.MSID AND users.USID = messages.USID AND messages.TPID = types.TPID
  `
    : `
    SELECT messages.*, type
    FROM messages, types
    WHERE '${MSID}' = messages.MSID AND messages.TPID = types.TPID
  `

  connection.query(SQL, (err, row) => {
    if (err) throw err
    let Obj = row[0]
    Obj.time = formatTime(Obj.time, 'full')
    if (Obj.duration) {
      Obj.voiceFile = `/voice/${MSID}.aac`
    }
    fs.access(`${FilePath}/case/${MSID}`, err => {
      if (!err) {
        const imgs = fs
          .readdirSync(`${FilePath}/case/${MSID}`)
          .map(v => `/case/${MSID}/${v}`)
        Obj.imgFile = imgs
      }
      res.send(Obj)
      connection.end()
    })
  })
})

app.listen(80, () => console.log('ok...' + new Date()))
