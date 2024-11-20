import SwiftUI

struct MainView: View {
    @State private var isLoggedOut = false

    var body: some View {
        NavigationView {
            VStack {
                Text("Welcome to NoSwipeApp!")
                    .font(.largeTitle)
                    .padding()

                Spacer()

                Button(action: {
                    self.logout()
                }) {
                    Text("Logout")
                        .foregroundColor(.white)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.red)
                        .cornerRadius(8)
                }
                .padding([.leading, .trailing], 10)
            }
            .padding()
            .navigationBarHidden(true)
            .fullScreenCover(isPresented: $isLoggedOut) {
                // Navigate back to the login screen
                LoginView()
            }
        }
    }

    func logout() {
        // Delete token from Keychain
        KeychainHelper.shared.delete(service: "NoSwipeApp", account: "authToken")
        self.isLoggedOut = true
    }
}

struct MainView_Previews: PreviewProvider {
    static var previews: some View {
        MainView()
    }
}
