const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const banks = {
  ku: [
    ["کامپیوتەر چییە؟",["ئامێرێکی ئەلیکترۆنی","کتێبێک","ژوورێک","یارییەک"],0],
    ["پایتەختی هەرێمی کوردستان چییە؟",["هەولێر","سلێمانی","دهۆک","کەرکووک"],0],
    ["ئاوی پاک لە چ دۆخێکدا دەجوشێت؟",["١٠٠°C","٥٠°C","٠°C","٢٠٠°C"],0],
    ["زەوی بە دەوری چی دەسوڕێتەوە؟",["خۆر","مانگ","زەحل","مریخ"],0],
    ["HTML بۆ چی بەکاردێت؟",["دروستکردنی پەڕەی وێب","گۆرینی وێنە","دەنگ تۆمارکردن","چاپکردن"],0]
  ],
  en: [
    ["What is a computer?",["An electronic device","A book","A room","A game"],0],
    ["What is the capital of Kurdistan Region?",["Erbil","Sulaymaniyah","Duhok","Kirkuk"],0],
    ["At what temperature does clean water boil?",["100°C","50°C","0°C","200°C"],0],
    ["What does the Earth orbit?",["The Sun","The Moon","Saturn","Mars"],0],
    ["What is HTML used for?",["Building web pages","Editing photos","Recording audio","Printing"],0]
  ],
  ar: [
    ["ما هو الحاسوب؟",["جهاز إلكتروني","كتاب","غرفة","لعبة"],0],
    ["ما عاصمة إقليم كردستان؟",["أربيل","السليمانية","دهوك","كركوك"],0],
    ["في أي درجة يغلي الماء النقي؟",["100°C","50°C","0°C","200°C"],0],
    ["حول ماذا تدور الأرض؟",["الشمس","القمر","زحل","المريخ"],0],
    ["ما استخدام HTML؟",["إنشاء صفحات الويب","تحرير الصور","تسجيل الصوت","الطباعة"],0]
  ],
  tr: [
    ["Bilgisayar nedir?",["Elektronik bir cihaz","Kitap","Oda","Oyun"],0],
    ["Kürdistan Bölgesi'nin başkenti neresidir?",["Erbil","Süleymaniye","Duhok","Kerkük"],0],
    ["Temiz su kaç derecede kaynar?",["100°C","50°C","0°C","200°C"],0],
    ["Dünya neyin etrafında döner?",["Güneş","Ay","Satürn","Mars"],0],
    ["HTML ne için kullanılır?",["Web sayfaları oluşturmak","Fotoğraf düzenlemek","Ses kaydetmek","Yazdırmak"],0]
  ]
};

let state = {lang:"ku", type:"mcq", questions:[]};

function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function renderQuestions(){
  const box=$("#questions");
  if(!state.questions.length){box.innerHTML='<div class="empty">هێشتا هیچ پرسیارێکت دروست نەکردووە. لە سەرەوە "دروستکردنی تاقیکردنەوە" دابگرە.</div>';return;}
  box.innerHTML=state.questions.map((q,i)=>`
    <article class="question">
      <div class="q-head"><span class="q-number">پرسیاری ${i+1}</span><button class="delete" onclick="removeQuestion(${i})">سڕینەوە</button></div>
      <input value="${escapeHtml(q.text)}" oninput="state.questions[${i}].text=this.value" placeholder="پرسیار بنووسە">
      <div class="answers">
        ${q.options.map((a,j)=>`<label class="answer"><input type="radio" name="correct${i}" ${q.correct===j?"checked":""} onchange="state.questions[${i}].correct=${j}"><input type="text" value="${escapeHtml(a)}" oninput="state.questions[${i}].options[${j}]=this.value"></label>`).join("")}
      </div>
    </article>`).join("");
}
function removeQuestion(i){state.questions.splice(i,1);renderQuestions()}
function makeQuestions(){
  const count=Math.min(30,Math.max(1,+$("#questionCount").value||5));
  const bank=banks[state.lang];
  state.questions=Array.from({length:count},(_,i)=>{
    const x=bank[i%bank.length]; return {text:x[0],options:[...x[1]],correct:x[2]};
  });
  renderQuestions();
  $("#questionsSection").scrollIntoView({behavior:"smooth"});
}
$$(".lang").forEach(b=>b.onclick=()=>{$$(".lang").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.lang=b.dataset.lang});
$$(".type").forEach(b=>b.onclick=()=>{
  $$(".type").forEach(x=>x.classList.remove("active"));b.classList.add("active");state.type=b.dataset.type;
  if(state.type==="tf") state.questions=state.questions.map(q=>({text:q.text,options:["ڕاست","هەڵە"],correct:q.correct===0?0:1}));
  renderQuestions();
});
$$(".step").forEach(b=>b.onclick=()=>{let n=+$("#questionCount").value+(+b.dataset.step);$("#questionCount").value=Math.min(30,Math.max(1,n))});
$("#generateBtn").onclick=makeQuestions;
$("#addQuestionBtn").onclick=()=>{state.questions.push({text:"پرسیاری نوێ",options:["هەڵبژاردەی A","هەڵبژاردەی B","هەڵبژاردەی C","هەڵبژاردەی D"],correct:0});renderQuestions()};
$("#clearBtn").onclick=()=>{if(confirm("هەموو پرسیارەکان بسڕینەوە؟")){state.questions=[];renderQuestions()}};
$("#imageInput").onchange=e=>{const f=e.target.files[0];if(!f)return;$("#previewImage").src=URL.createObjectURL(f);$("#previewImage").hidden=false};

function openPreview(){
  if(!state.questions.length){alert("سەرەتا تاقیکردنەوەکە دروست بکە.");return}
  $("#modalTitle").textContent=$("#quizTitle").value||"تاقیکردنەوە";
  $("#result").hidden=true;
  $("#quizPreview").innerHTML=state.questions.map((q,i)=>`
    <div class="preview-q" data-q="${i}">
      <h3>${i+1}. ${escapeHtml(q.text)}</h3>
      ${q.options.map((o,j)=>`<button class="option" data-q="${i}" data-a="${j}">${escapeHtml(o)}</button>`).join("")}
    </div>`).join("")+`<button class="primary quiz-submit" id="submitQuiz">ناردنی وەڵامەکان</button>`;
  $$(".option").forEach(btn=>btn.onclick=()=>{$$(`.option[data-q="${btn.dataset.q}"]`).forEach(x=>x.dataset.selected="");btn.dataset.selected="1";});
  $("#submitQuiz").onclick=grade;
  $("#quizModal").hidden=false;
}
function grade(){
  let score=0;
  state.questions.forEach((q,i)=>{
    const chosen=$(`.option[data-q="${i}"][data-selected="1"]`);
    if(chosen && +chosen.dataset.a===q.correct)score++;
    $$(`.option[data-q="${i}"]`).forEach(o=>{if(+o.dataset.a===q.correct)o.classList.add("correct-option");});
    if(chosen && +chosen.dataset.a!==q.correct)chosen.classList.add("wrong-option");
  });
  $("#result").hidden=false;
  $("#result").innerHTML=`<b>ئەنجام: ${score} / ${state.questions.length}</b><br><span class="muted">نمرەکە تەنها لەسەر ئەم تاقیکردنەوەیە حساب کراوە.</span>`;
}
$("#previewBtn").onclick=openPreview;
$("#closeModal").onclick=()=>$("#quizModal").hidden=true;
$("#quizModal").onclick=e=>{if(e.target.id==="quizModal")$("#quizModal").hidden=true};
renderQuestions();