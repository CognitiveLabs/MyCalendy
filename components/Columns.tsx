export default function Columns() {
  return (
    <div className="flex flex-wrap justify-center pt-10">
      {/* Column 1: Cognitive Functions */}
      <div className=" blue-column">
        <div
          style={{ backgroundColor: "#38b6ff" }}
          className=" rounded-md rounded-bl-md p-4 mb-4"
        >
          <h3 className="text-white text-center font-bold h-10 nudge">
            Cognitive Abilities
          </h3>
          <ul className="text-left text-white  mr-5 nudge-left">
            <li className="list-item">Analytical</li>
            <li className="list-item">Perceptual</li>
            <li className="list-item">Creative</li>
            <li className="list-item">Conceptual</li>
            <li className="list-item">Strategic</li>
            <li className="list-item">Administrative</li>
            <li className="list-item">Technical</li>
            <li className="list-item">Collaborative</li>
          </ul>
        </div>
      </div>
      {/* Column 2: Definitions */}
      <div className="column">
        <div className="bg-green-500 rounded-md rounded-bl-md pt-4 pb-4 pl-1 pr-1 mb-4">
          <h3 className="text-white text-center font-bold h-10">Definitions</h3>
          <ul className="pl-3 text-white  nudge-left">
            <li className="list-item">
              <strong>Break down</strong> complex information, find patterns,
              and draw <strong>logical conclusions</strong>.
            </li>
            <li className="list-item">
              <strong>Process</strong> and <strong>interpret</strong> details,
              patterns, and <strong>information</strong>.
            </li>
            <li className="list-item">
              <strong>Generate ideas and solutions</strong> in an unstructured,
              free-flowing manner.
            </li>
            <li className="list-item">
              <strong>Create concepts</strong> and form{" "}
              <strong>innovative connections</strong> between ideas.
            </li>
            <li className="list-item">
              <strong>Pivoting</strong> to use your same resources in new and
              beneficial ways.
            </li>
            <li className="list-item">
              <strong>Efficiently organize</strong> and <b>manage</b> tasks,
              resources, and people .
            </li>
            <li className="list-item">
              Apply <strong>specialized knowledge</strong> and{" "}
              <strong>skills</strong> to solve{" "}
              <strong>practical problems</strong>.
            </li>
            <li className="list-item">
              <strong>Work cooperatively with others</strong> to achieve{" "}
              <strong>shared objectives</strong>.
            </li>
          </ul>
        </div>
      </div>
      {/* Column 3: Examples */}
      <div className="column">
        <div className="bg-orange-500 rounded-md rounded-bl-md pt-4 pb-4 pl-1 pr-1 ">
          <h3 className="text-white text-center  font-bold  h-10">Examples</h3>
          <ul className="pl-3 text-white nudge-left">
            <li className="list-item">
              Puzzles, data analysis, code review for{" "}
              <strong>sharp mornings (peak focus)</strong>.
            </li>
            <li className="list-item">
              Proofreading, image editing, design in{" "}
              <strong>high-acuity afternoons</strong>.
            </li>
            <li className="list-item">
              Brainstorming, writing sessions during{" "}
              <strong>relaxed moments (free thinking)</strong>.
            </li>
            <li className="list-item">
              Quiet, distraction-free periods for{" "}
              <strong>strategic planning & reports</strong>.
            </li>
            <li className="list-item">
              Long-term goals, budgeting in{" "}
              <strong>clear mornings (future focus)</strong>.
            </li>
            <li className="list-item">
              Emails, filing, data entry for{" "}
              <strong>lower energy, focused times</strong>.
            </li>
            <li className="list-item">
              Coding, troubleshooting during{" "}
              <strong>peak energy & focus periods</strong>.
            </li>
            <li className="list-item">
              Meetings, projects when{" "}
              <strong>energy & communication are high</strong>.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
