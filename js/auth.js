$(function () {
  let existingUserId = sessionStorage.getItem("userId")
  if (existingUserId) {
    window.location.href = "../html/home.html"
    return
  }
  let signupPageButton = $(".signupPageBtn")
  let loginPageButton = $(".loginPageBtn")
  let loginButton = $(".loginBtn")
  let loginForm = $(".loginForm")
  let signupForm = $(".signupForm")

  let loginSection = $(".login")
  let signupSection = $(".signup")

  let loginEmailInput = $(".login .email")
  let loginPasswordInput = $(".login .password")

  let signupEmailInput = $(".signup .email")
  let usernameInput = $(".username")
  let signupPasswordInput = $(".signup .password")

  let loginError = $(".login .error")
  let signupError = $(".signup .error")

  let showPass = $(".show-pass")
  let hidePass = $(".hide-pass")

  hidePass.show()
  showPass.hide()

  signupPageButton.on("click", function () {
    signupTab.trigger("click")
    loginError.hide()
  })

  loginPageButton.on("click", function () {
    loginTab.trigger("click")
    signupError.hide()
  })

  loginForm.on("submit", function (e) {
    e.preventDefault()

    if (loginEmailInput.val() === "" || loginPasswordInput.val() === "") {
      loginError.text("Please enter all required fields!").show()
      return
    }

    loginButton.prop("disabled", true).addClass("loading")

    $.getJSON("../js/data.json")
      .done(function (data) {
        let users = data.users || []
        let foundUser = users.find(
          (user) =>
            user.email === loginEmailInput.val() &&
            user.password === loginPasswordInput.val()
        )

        if (foundUser) {
          sessionStorage.setItem("userId", foundUser.id)
          window.location.href = "../html/home.html"
        } else {
          loginError.text("Incorrect email or password!").show()
          loginEmailInput.val("")
          loginPasswordInput.val("")
        }
      })
      .fail(function (err) {
        console.error("error fetching users:", err)
      })
      .always(function () {
        loginButton.prop("disabled", false).removeClass("loading")
      })
  })

  signupForm.on("submit", function (e) {
    e.preventDefault()
    if (
      usernameInput.val().trim() === "" ||
      signupEmailInput.val().trim() === "" ||
      signupPasswordInput.val().trim() === ""
    ) {
      signupError.text("Please enter all required fields!").show()
      return
    }

    if (signupPasswordInput.val().length < 8) {
      signupError.text("Password must be at least 8 characters").show()
      return
    }
    window.location.href = "../html/home.html"
  })

  hidePass.on("click", function () {
    let btn = $(this)
    let input = btn.siblings("input").first()

    input.attr("type", "text")
    btn.hide()
    btn.siblings(".show-pass").show()
  })

  showPass.on("click", function () {
    let btn = $(this)
    let input = btn.siblings("input").first()

    input.attr("type", "password")
    btn.hide()
    btn.siblings(".hide-pass").show()
  })

  let loginTab = $(".loginTab")
  let signupTab = $(".signupTab")

  signupTab.on("click", function () {
    signupTab.addClass("active")
    loginTab.removeClass("active")

    signupSection.addClass("show")
    loginSection.hide()
  })

  loginTab.on("click", function () {
    loginTab.addClass("active")
    signupTab.removeClass("active")

    loginSection.show()
    signupSection.removeClass("show")
  })
})