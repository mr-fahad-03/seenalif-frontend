"use client";

import React from "react";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicyArabic() {
  const navigate = useNavigate();

  const handleEnglishClick = () => {
    navigate('/privacy-policy');
  };

  return (
    <div dir="rtl" className="bg-white min-h-screen px-4 md:px-12 py-10 font-sans text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-black">
          سياسة الخصوصية
        </h1>
        
        {/* Language Switch Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleEnglishClick}
            className="bg-lime-500 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <span>English</span>
            <span>الإنجليزية</span>
          </button>
        </div>

        <section className="space-y-6 text-base leading-8">
          <div>
            <h2 className="text-xl font-semibold text-black mb-2">مقدمة</h2>
            <p>
              تحترم شركة Grabatoz المدعومة من Crown Excel General Trading LLC
              ("نحن"، "لنا" أو "خاصتنا") خصوصيتك وتلتزم بحماية بياناتك الشخصية.
              توضح سياسة الخصوصية هذه كيفية جمع معلوماتك واستخدامها وحمايتها عند
              استخدامك لموقعنا الإلكتروني grabatoz.ae والخدمات ذات الصلة.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">جمع واستخدام البيانات</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>نحن لا نجمع بيانات شخصية من المستخدمين المقيمين في الاتحاد الأوروبي.</li>
              <li>
                نستخدم مزودي خدمات من طرف ثالث مخولين، مثل بوابات الدفع وأدوات التحليل
                ومزودي الشحن، لتشغيل وتحسين خدماتنا. قد يقوم هؤلاء الطرف الثالث بجمع
                ومعالجة البيانات وفقًا لسياسات الخصوصية الخاصة بهم.
              </li>
              <li>
                نجمع المعلومات التي تقدمها طواعيةً، مثل التسجيل أو الشراء أو التواصل مع
                دعم العملاء، ونستخدمها فقط لتقديم خدماتنا وتخصيصها وتحسينها.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">ملفات تعريف الارتباط وتقنيات التتبع</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>
                يستخدم موقعنا ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتحسين تجربة
                المستخدم والأمان ووظائف الموقع.
              </li>
              <li>
                قد تُستخدم ملفات تعريف الارتباط لتذكر تفضيلاتك، وتمكين ميزات التسوق،
                وتحليل حركة الموقع، وعرض محتوى أو إعلانات مخصصة.
              </li>
              <li>
                يمكنك تعطيل ملفات تعريف الارتباط من خلال إعدادات المتصفح، لكن بعض ميزات
                الموقع قد لا تعمل بشكل صحيح بدون تمكين ملفات تعريف الارتباط.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">حقوقك</h2>
            <ul className="list-disc pr-6 space-y-2">
              <li>لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها.</li>
              <li>يمكنك إلغاء الاشتراك في الاتصالات التسويقية في أي وقت.</li>
              <li>
                لأي استفسارات متعلقة بالخصوصية أو لممارسة حقوقك، يرجى التواصل معنا على:
                <span className="text-blue-600"> customercare@grabatoz.ae</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">أمان البيانات</h2>
            <p>
              نطبق التدابير الفنية والتنظيمية المناسبة لحماية بياناتك من الوصول غير
              المصرح به أو الفقدان أو التغيير. ومع ذلك، لا يمكن ضمان الأمان الكامل
              للبيانات أثناء النقل عبر الإنترنت.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">تغييرات هذه السياسة</h2>
            <p>
              قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سيتم نشر التغييرات على هذه
              الصفحة مع تاريخ النفاذ المحدث.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-black mb-2">معلومات الاتصال</h2>
            <p>شركة Crown Excel General Trading LLC</p>
            <p>صندوق بريد: 241975، دبي</p>
            <p>هاتف: +971 0505033860</p>
            <p>البريد الإلكتروني: customercare@grabatoz.ae</p>
            <p>ساعات خدمة العملاء: يوميًا من 9:00 صباحًا حتى 7:00 مساءً</p>
          </div>
        </section>
      </div>
    </div>
  );
}
