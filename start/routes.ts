/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async ({ view }) => {
  return view.render('welcome')
})

Route.get('/user/home', () => {
  return 'Render view of user home with their tarantulas in a table'
})

Route.get('/user/signup', () => {
  return 'Render form for user signup'
})

Route.post('/user/signup', () => {
  return 'Post route for user signup'
})

Route.get('/user/login', () => {
  return 'Render form for user login'
})

Route.post('/user/login', () => {
  return 'Post route for user login'
})

Route.get('/tarantula/create', () => {
  return 'Render form for creating new tarantula'
})

Route.post('/tarantula/create', () => {
  return 'Post route for making new tarantula'
})

Route.get('/tarantula/view/:id', () => {
  return 'Render view of tarantula with id'
})
