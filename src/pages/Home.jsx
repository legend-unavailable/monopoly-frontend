import {useNavigate} from "react-router-dom"

const Home = () => {
  const moveTo = useNavigate();
  const nextPage = () => {
    moveTo('/Login');
  }
    return (
      <>
        <div className="container p-2">
          <div className="row p-1">
            <div className="col">
              <h1 className="text-center">
                Welcome to Monopoly Millionaire Online
              </h1>
            </div>
          </div>
          <div className="row d-flex justify-content-center">
            <div
              className="overflow-y-scroll"
              style={{ maxHeight: "700px", maxWidth: "500px" }}
            >
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio
              quos nostrum commodi error maxime tempore debitis laborum ullam,
              natus itaque tenetur rem veritatis maiores ea dolore asperiores
              dignissimos blanditiis adipisci nihil consequuntur quisquam!
              Dolorem, saepe accusantium in aspernatur atque ipsum debitis
              commodi consequatur amet animi, est illo eveniet laboriosam soluta
              quidem, similique repellendus magni. Similique doloremque
              temporibus nihil numquam et, ea rem incidunt ullam debitis
              voluptatem quia nulla voluptates exercitationem dolorem itaque at,
              dolorum porro. Nihil expedita eum fugit, ipsa commodi placeat
              tempora veritatis, cupiditate rerum corporis, neque porro nostrum
              quas iusto pariatur facere. Beatae, est molestias? Voluptates quam
              officia deserunt ad obcaecati corporis accusamus iure
              exercitationem necessitatibus fuga in illo commodi aperiam nulla
              quis, quae illum dignissimos laborum quaerat dicta eum quasi
              dolorum tempora. Libero, est ea! Nesciunt animi nobis ab
              reiciendis obcaecati dolorem eos esse soluta. Nam earum cupiditate
              assumenda quibusdam dolorum a necessitatibus. Animi praesentium
              suscipit numquam necessitatibus omnis deserunt eveniet esse hic
              odit ipsam porro blanditiis sed id eos odio facilis, alias iusto!
              A debitis aspernatur hic doloribus similique deleniti dolor fugit
              iusto inventore obcaecati impedit minima ex odit neque tempore,
              adipisci dolorum nam unde ad ducimus provident eaque aperiam dicta
              distinctio! Quasi non, atque aut, quo aspernatur eligendi aliquam
              impedit recusandae laudantium, eaque deleniti natus? Nostrum, sint
              repellat. Fugit magnam perspiciatis iste quas debitis officiis
              consequuntur accusamus tempora eius, nesciunt delectus alias at
              facere! Debitis sapiente, quae perspiciatis sit, vitae temporibus
              ratione fuga nisi a officiis delectus voluptas error neque, maxime
              vero facilis velit! Sequi nostrum repellendus harum pariatur,
              officia aperiam quisquam eos nisi cumque quis similique molestias
              atque amet esse. Atque debitis ducimus unde repellat illum dolor
              aliquam sapiente officiis vel! Eligendi magnam eveniet laborum
              sapiente consequuntur tenetur excepturi tempore officia
              necessitatibus error consequatur ipsa reprehenderit, esse alias
              fuga deleniti cumque fugiat commodi natus.
            </div>
            <div className="container d-flex justify-content-center p-5">
              <button className="btn btn-primary" onClick={() => nextPage()}>Continue</button>
            </div>
          </div>
        </div>
      </>
    );

}

export default Home;