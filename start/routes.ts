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
  return await view.render('home')
})

Route.get('/user/signup', 'SignupController.index')

Route.post('/user/signup', 'SignupController.post')

Route.get('/user/login', 'LoginController.index')

Route.post('/user/login', 'LoginController.post')

Route.group(() => {
  Route.post('/user/logout', async ({ auth, response, session }) => {
    session.flash('global_message', 'Logged out successfully')
    await auth.use('web').logout()
    response.redirect('/')
  })

  Route.get('/user/home', 'DashboardController.index')

  //RESTful CRUD routes; User's id is implied on all routes (getting from auth context)
  //CREATE
  Route.get('/user/tarantula/create', 'TarantulaController.index')
  Route.post('/user/tarantula', 'TarantulaController.post')

  //READ
  Route.get('/user/tarantula', 'TarantulaController.all')
  Route.get('/user/tarantula/:tarantulaId', 'TarantulaController.one')

  //UPDATE
  Route.get('/user/tarantula/:tarantulaId/update', 'TarantulaController.indexUpdate')
  Route.put('/user/tarantula/:tarantulaId/update', 'TarantulaController.update')

  //DELETE
  Route.delete('/user/tarantula/:tarantulaId/delete', 'TarantulaController.delete')
}).middleware('auth:web')
