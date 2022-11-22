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

  Route.get('/user/home', async () => {
    return 'Render view of user home with their tarantulas in a table'
  })

  Route.get('/tarantula/create', async () => {
    return 'Render form for creating new tarantula'
  })

  Route.post('/tarantula/create', async () => {
    return 'Post route for making new tarantula'
  })

  Route.get('/tarantula/view/:id', async () => {
    return 'Render view of tarantula with id'
  })
}).middleware('auth:web')
