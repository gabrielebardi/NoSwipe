import SwiftUI

struct RegisterView: View {
    @State private var username = ""
    @State private var email = ""
    @State private var password = ""
    @State private var password2 = ""
    @State private var firstName = ""
    @State private var lastName = ""
    @State private var successMessage = ""
    @State private var errorMessage = ""
    @State private var isLoading = false
    @Environment(\.presentationMode) var presentationMode // To dismiss the view

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Text("Register")
                    .font(.largeTitle)
                    .padding(.top, 40)

                TextField("Username", text: $username)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                
                TextField("Email", text: $email)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)

                SecureField("Password", text: $password)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                SecureField("Confirm Password", text: $password2)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                TextField("First Name", text: $firstName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                TextField("Last Name", text: $lastName)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding(.horizontal)

                if !successMessage.isEmpty {
                    Text(successMessage)
                        .foregroundColor(.green)
                        .padding(.horizontal)
                }

                if !errorMessage.isEmpty {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .padding(.horizontal)
                }

                if isLoading {
                    ProgressView("Registering...")
                        .padding()
                }

                Button(action: {
                    self.register()
                }) {
                    Text("Register")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(isLoading ? Color.gray : Color.green)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
                .disabled(isLoading)

                Spacer()
            }
            .padding(.bottom, 40)
        }
        .navigationBarTitle("Register", displayMode: .inline)
    }

    func register() {
        guard !username.isEmpty,
              !email.isEmpty,
              !password.isEmpty,
              !password2.isEmpty,
              !firstName.isEmpty,
              !lastName.isEmpty else {
            self.errorMessage = "Please fill in all fields."
            return
        }

        guard password == password2 else {
            self.errorMessage = "Passwords do not match."
            return
        }

        self.isLoading = true
        self.errorMessage = ""
        self.successMessage = ""

        NetworkManager.shared.register(
            username: username,
            email: email,
            password: password,
            password2: password2,
            firstName: firstName,
            lastName: lastName
        ) { result in
            DispatchQueue.main.async {
                self.isLoading = false
                switch result {
                case .success:
                    self.successMessage = "Registration successful! Redirecting to login..."
                    // Delay to show the success message
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        self.presentationMode.wrappedValue.dismiss() // Dismiss to go back to LoginView
                    }
                case .failure(let error):
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
}

struct RegisterView_Previews: PreviewProvider {
    static var previews: some View {
        RegisterView()
    }
}